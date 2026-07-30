// =============================
// SUPABASE CONNECTION
// =============================


const SUPABASE_URL = "https://hffzlllruubksgsahvsu.supabase.co";

const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmZnpsbGxydXVia3Nnc2FodnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNTYxMTMsImV4cCI6MjEwMDYzMjExM30.F89SrP2jYQrt9JLBJes1Sb9czJ7OKL283rDRY887DiM";


const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);



let orders = [];



// =============================
// LOAD ORDERS
// =============================


async function loadOrders(){

    const {data,error}= await supabaseClient
        .from("orders")
        .select("*")
        .order(
            "created_at",
            {
                ascending:false
            }
        );


    if(error){

        console.log(error);
        return;

    }


    orders=data;

    displayOrders();

    updateStats();

    createTableFilter();

}




// =============================
// DISPLAY ORDERS
// =============================


function displayOrders(){


const container=document.getElementById(
    "ordersContainer"
);


container.innerHTML="";



let filtered=[...orders];



// search

const search=document
.getElementById("searchInput")
.value
.toLowerCase();



if(search){

filtered=filtered.filter(order=>

(order.customer_name || "")
.toLowerCase()
.includes(search)

||

(order.customer_phone || "")
.includes(search)

);

}




// type filter


const type=document
.getElementById("typeFilter")
.value;



if(type !== "all"){

filtered=filtered.filter(
order=>order.order_type===type
);

}




// status filter


const status=document
.getElementById("statusFilter")
.value;



if(status !== "all"){

filtered=filtered.filter(
order=>order.status===status
);

}




// table filter


const table=document
.getElementById("tableFilter")
.value;



if(table !== "all"){

filtered=filtered.filter(
order=>String(order.table_number)===table
);

}




filtered.forEach(order=>{


let items="";


order.items.forEach(item=>{

items += `

<div class="item">

<span>
${item.name}
 x ${item.quantity}
</span>


<span>
${item.price}
</span>


</div>

`;

});





container.innerHTML += `


<div class="order-card">


<div class="order-header">


<div class="customer">

${order.customer_name}

</div>


<span class="badge ${order.status}-badge">

${order.status}

</span>


</div>



<p>
📞 ${order.customer_phone}
</p>


<p>

${order.order_type==="delivery"

? "🚚 Delivery: "+order.delivery_address

: "🍽 Table: "+(order.table_number || "-")

}

</p>



<div class="items">

${items}

</div>



<div class="total">

Total: ${order.total_amount} ETB

</div>



<div class="buttons">


<button 
class="prepare"
onclick="updateStatus('${order.id}','preparing')">

Preparing

</button>


<button 
class="ready-btn"
onclick="updateStatus('${order.id}','ready')">

Ready

</button>



<button 
class="complete"
onclick="updateStatus('${order.id}','completed')">

Completed

</button>



<button 
class="cancel"
onclick="updateStatus('${order.id}','cancelled')">

Cancel

</button>


</div>



</div>


`;

});


}





// =============================
// UPDATE STATUS
// =============================


async function updateStatus(id,status){


await supabaseClient

.from("orders")

.update({

status:status

})

.eq(
"id",
id
);



loadOrders();


}






// =============================
// STATISTICS
// =============================


function updateStats(){


document
.getElementById("totalOrders")
.innerText=orders.length;



document
.getElementById("pendingOrders")
.innerText=
orders.filter(
o=>o.status==="pending"
).length;



document
.getElementById("preparingOrders")
.innerText=
orders.filter(
o=>o.status==="preparing"
).length;



document
.getElementById("readyOrders")
.innerText=
orders.filter(
o=>o.status==="ready"
).length;


}






// =============================
// TABLE FILTER
// =============================


function createTableFilter(){


const select=
document.getElementById(
"tableFilter"
);



let tables=[
...new Set(
orders
.map(o=>o.table_number)
.filter(Boolean)
)
];



select.innerHTML=
`
<option value="all">
All Tables
</option>
`;



tables.forEach(table=>{


select.innerHTML +=`

<option value="${table}">
Table ${table}
</option>

`;

});


}






// =============================
// REAL TIME
// =============================


supabaseClient

.channel("orders")

.on(

"postgres_changes",

{

event:"*",

schema:"public",

table:"orders"

},

(payload)=>{


console.log(
"Order update",
payload
);


loadOrders();


}

)

.subscribe();







// =============================
// EVENTS
// =============================


document
.getElementById("searchInput")
.addEventListener(
"input",
displayOrders
);


document
.getElementById("typeFilter")
.addEventListener(
"change",
displayOrders
);


document
.getElementById("statusFilter")
.addEventListener(
"change",
displayOrders
);


document
.getElementById("tableFilter")
.addEventListener(
"change",
displayOrders
);






loadOrders();