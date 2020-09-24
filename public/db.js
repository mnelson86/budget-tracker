let db;

const request= indexedDB.open("budget", 1);

request.onupgradeneeded= function (event) {
    const db= event.target.result;
    db.createObjectStore("pending", {autoIncrement= true});
};

request.onsuccess= function(event) {
    db= event.target.result;
    tx= db.transaction("pending", "readwrite");
    
    //checks if app is online before reading from db
    if (navigator.online) {
        checkDatabase();
    }
};

request.onerror= function(event) {
    console.log("Error: " + event.target.errorCode);
};

function saveRecord(record) {
    //creates a transaction on the pending db with readwrite access
    const transaction = db.transaction(["pending"], "readwrite");

    //accesses pending object store
    const store= transaction.objectStore("pending");

    store.add(record);
}

function checkDatabase() {
    const transaction= db.transaction(["pending"], "readwrite");
    const store= transaction.objectStore("pending");
    const getAll= store.getAll();

    getAll.onsuccess= function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                },
            })
            .then((response) => response.json())
            .then(() => {
                const transaction= db.transaction(["pending"], "readwrite");
                const store= transaction.objectStore("pending");
                store.clear();
            });
        }
    };
}
window.addEventListener("online", checkDatabase);