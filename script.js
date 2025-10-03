const data = [
    {
        name: "Category 1",
        color: "#0f0",
        folded: false,
        items: [
            { name: "Charm 1", amount: 16, price: 200, cartTotal: 1 },
            { name: "Charm 2", amount: 16, price: 200, cartTotal: 0 },
            { name: "Charm 3", amount: 16, price: 200, cartTotal: 0 },
            { name: "Charm 4", amount: 16, price: 200, cartTotal: 0 },
            { name: "Charm 5", amount: 16, price: 200, cartTotal: 0 }
        ]
    },
    {
        name: "Category 2",
        color: "#08f",
        folded: false,
        items: [
            { name: "Charm 6", amount: 16, price: 200, cartTotal: 0 },
            { name: "Charm 7", amount: 16, price: 200, cartTotal: 0 },
            { name: "Charm 8", amount: 16, price: 200, cartTotal: 0 },
            { name: "Charm 10", amount: 16, price: 200, cartTotal: 0 },
        ]
    }
]


const globals = {
    totalProfit: 1000.78,
    editButtonsVisible: false,
    mainDiv: document.querySelector("main"),
    totalProfitP: document.getElementById("header-total-profit")
}

function createCategoryDiv(category) {
    const categoryDiv = document.createElement("div")
    categoryDiv.classList.add("main-category")
    categoryDiv.style.backgroundColor = category.color
    categoryDiv.onclick = () => toggleFoldCategory(category.name)
    categoryDiv.innerHTML = `
        <p class="main-category-name">${category.name} <span class="icon">${category.folded ? "▷" : "▽"}</span></p>
    `
    return categoryDiv
}

function createItemsHolderDiv() {
    const itemsDiv = document.createElement("div")
    itemsDiv.classList.add("main-category-items")
    return itemsDiv
}

function createItemDiv(item) {
    const itemDiv = document.createElement("div")
    itemDiv.classList.add("main-item")
    if (item.cartTotal > 0) {
        itemDiv.classList.add("main-item-selected")
    }
    itemDiv.innerHTML = `
        <div class="main-item-marker">
        </div>
        <div class="main-item-left">
            <span>[ ${item.amount} ] ${item.name} - P${item.price}</span>
        </div>
        <div class="main-item-right">
            <div class="main-item-icons">
                ${globals.editMode ? "<span class=\"box icon\" onclick=\"addItemToCart(\'${item.name}\')\">✍️</span>" : item.cartTotal}
                <span class="box icon" onclick="addItemToCart('${item.name}')">➕</span>
                <span class="box icon" onclick="removeItemFromCart('${item.name}')">➖</span>
            </div>
        </div>
    `
    return itemDiv
}

function updateCategory(category) {
    const newView = createCategoryDiv(category)
    category.view.replaceWith(newView)
    category.view = newView

    if (category.folded) {
        category.itemsHolderDiv.style.display = "none";
    }

    if (!category.folded) {
        category.itemsHolderDiv.style.display = "grid";
    }
}

function updateItem(item) {
    const newView = createItemDiv(item)
    item.view.replaceWith(newView)
    item.view = newView
}

function updateAllItems() {
    for (category of data) {
        for (item of category.items) updateItem(item)
    }
}

function initializeSite() {
    // localstorage

    globals.mainDiv.innerHTML = ""
    for (const category of data) {
        category.view = createCategoryDiv(category)
        category.itemsHolderDiv = createItemsHolderDiv()

        for (item of category.items) {
            const itemDiv = createItemDiv(item)
            category.itemsHolderDiv.appendChild(itemDiv)
            item.view = itemDiv
        }

        globals.mainDiv.appendChild(category.view)
        globals.mainDiv.appendChild(category.itemsHolderDiv)
    }
}

function getCart() {
    const cart = []
    for (const entry of data) {
        for (const item of entry.items) {
            if (item.cartTotal > 0) cart.push(item)
        }
    }
    return cart
}

function addItemToCart(name) {
    if (!globals.editMode) {
        const item = getItem(name)
        if (item) {
            item.cartTotal++
            updateItem(item)
        }
    }
}

function removeItemFromCart(name) {
    if (!globals.editMode) {
        const item = getItem(name)
        if (item && item.cartTotal > 0) {
            item.cartTotal--
            updateItem(item)
        }
    }
}

function getCategory(name) {
    const category = data.filter(category => category.name == name)
    if (category.length != 0) return category[0]
    return null
}

function getItem(name) {
    for (const category of data) {
        const item = category.items.filter(item => item.name == name)
        if (item.length != 0) return item[0]
    }
    return null;
}

function addItem(name, amount, price, categoryName) {
    const category = getCategory(categoryName)

    if (category) {
        const item = { name, amount, price, cartTotal: 0 }
        item.view = createItemDiv(item)
        category.items.push(item)
        category.itemsHolderDiv.appendChild(item.view)
    }
}

function removeItem(name) {
    for (entry of data) {
        const items = entry.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].name == name) {
                items[i].view.remove()
                items.splice(i, 1)
                break
            }
        }
    }

}

function toggleFoldCategory(name) {
    const category = getCategory(name)
    if (category) {
        category.folded = !category.folded
        updateCategory(category)
    }
}

function foldAllCategories() {
    for (category of data) {
        category.folded = true
        updateCategory(category)
    }
}

function expandAllCategories() {
    for (category of data) {
        category.folded = false
        updateCategory(category)
    }
}

function emptyCart() {
    const cart = getCart()
    for (item of cart) {
        item.cartTotal = 0
        updateItem(item)
    }
}

function toggleEditMode(button) {
    if (globals.editMode)
        button.textContent = "🫣 Edit Mode"
    else
        button.textContent = "👀 Normal Mode"
    globals.editMode = !globals.editMode
    emptyCart()
    updateAllItems()
}

initializeSite()

addItem("erm", 1, 1, "Category 1")
removeItem("Charm 3")
