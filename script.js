let data

const globals = {
    opts: {},
    mainDiv: document.querySelector("main"),
    header: {
        totalP: document.getElementById("header-total"),
        subtotalP: document.getElementById("header-subtotal"),
        editModeButton: document.getElementById("header-edit-mode-button")
    },
    popup: {
        newItemPopupDiv: document.getElementById("new-item-popup"),
        newItemForm: document.getElementById("new-item-form"),
        newItemCategorySelect: document.getElementById("new-item-category"),
        editItemPopupDiv: document.getElementById("edit-item-popup"),
        editItemForm: document.getElementById("edit-item-form"),
        editItemCategorySelect: document.getElementById("edit-item-category"),
        newCategoryPopupDiv: document.getElementById("new-category-popup"),
        newCategoryForm: document.getElementById("new-category-form"),
        editCategoryPopupDiv: document.getElementById("edit-category-popup"),
        editCategoryForm: document.getElementById("edit-category-form"),
        confirmDeletePopupDiv: document.getElementById("confirm-delete-popup"),
        confirmDeleteButton: document.getElementById("confirm-delete-button"),
        checkoutPopupDiv: document.getElementById("checkout-popup"),
        checkoutSummaryDiv: document.getElementById("checkout-summary"),
        checkoutCheckoutButton: document.getElementById("checkout-checkout-button"),
    }
}

function createCategoryDiv(category) {
    const icons = `
        <div class="main-item-icons">
                <span class="box icon" onclick="startEditingCategory('${category.name}')">✍️</span>
                <span class="box icon" onclick="startRemovingCategory('${category.name}')">❌</span>
        </div>
    `
    const categoryDiv = document.createElement("div")
    categoryDiv.classList.add("main-category")
    categoryDiv.style.backgroundColor = category.color
    categoryDiv.onclick = (e) => {
        if (e.target === categoryDiv) toggleFoldCategory(category.name)
    }
    categoryDiv.innerHTML = `
        <p class="main-category-name">${category.name} <span class="icon">${category.folded ? "▷" : "▽"}</span></p>
        ${globals.opts.editMode ? icons : ""}
    `
    return categoryDiv
}

function setTotal() {
    const res = prompt("New Total: ")
    if (res == null) return
    const total = Number(res)
    if (!isNaN(total) && total >= 0) {
        globals.opts.totalProfit = total
        updateSubtotalDiv()
        uploadToLocalStorage()
    } else {
        alert("What kinda money u got here bruh 💀")
    }
}

function updateSubtotalDiv() {
    const [, subtotal, amount] = getCart()
    const icon = `<span class="box icon" onclick="setTotal()">✍️</span>`
    globals.header.subtotalP.innerHTML = `🤠 ₱${subtotal} (${amount} items)`
    globals.header.totalP.innerHTML = `${globals.opts.editMode ? icon : ""} ₱${globals.opts.totalProfit}`
}

function createItemsHolderDiv() {
    const itemsDiv = document.createElement("div")
    itemsDiv.classList.add("main-category-items")
    return itemsDiv
}

function startRemovingItem(name) {
    openConfirmDeletePopup()
    globals.popup.confirmDeleteButton.onclick = () => {
        removeItem(name)
        closeConfirmDeletePopup()
        uploadToLocalStorage()
    }
}

function startRemovingCategory(name) {
    openConfirmDeletePopup()
    globals.popup.confirmDeleteButton.onclick = () => {
        removeCategory(name)
        closeConfirmDeletePopup()
        uploadToLocalStorage()
    }
}

function getCategoryFromItem(name) {
    for (const category of data) {
        for (const item of category.items) {
            if (item.name === name) return category
        }
    }
    return null
}

function startEditingItem(name) {
    const item = getItem(name)
    const category = getCategoryFromItem(name)
    if (item && category) {
        const values = [item.name, item.amount, item.price, name]
        globals.popup.editItemForm.querySelectorAll("input").forEach((input, i) => {
            input.value = values[i]
        })
        globals.popup.editItemCategorySelect.value = category.name
        sortItems(category.name)
        openEditItemPopup()
    }
}

function startEditingCategory(name) {
    const category = getCategory(name)
    if (category) {
        const values = [category.name, category.color, name]
        globals.popup.editCategoryForm.querySelectorAll("input").forEach((input, i) => {
            input.value = values[i]
        })
        openEditCategoryPopup()
    }
}

function createItemDiv(item) {
    const itemDiv = document.createElement("div")

    if (item.amount == 0)
        itemDiv.classList.add("main-item-out")
    else itemDiv.classList.remove("main-item-out")

    itemDiv.classList.add("main-item")
    if (item.cartTotal > 0) {
        itemDiv.classList.add("main-item-selected")
    }
    let icons
    if (globals.opts.editMode) {
        icons = `
            <span class="box icon" onclick="startEditingItem('${item.name}')">✍️</span>
            <span class="box icon" onclick="startRemovingItem('${item.name}')">❌</span>
        `
    } else {
        icons = `
            ${item.cartTotal}
            <span class="box icon" onclick="addItemToCart('${item.name}')">➕</span>
            <span class="box icon" onclick="removeItemFromCart('${item.name}')">➖</span>
        `
    }
    itemDiv.innerHTML = `
        <div class="main-item-marker">
        </div>
        <div class="main-item-left">
            <span>[${item.amount}] ${item.name} - ₱${item.price}</span>
        </div>
        <div class="main-item-right">
            <div class="main-item-icons">
                ${icons}
            </div>
        </div>
    `
    return itemDiv
}

function updateAllCategories() {
    for (const category of data) {
        updateCategory(category)
    }
}

function uploadToLocalStorage() {
    localStorage.setItem("data", JSON.stringify(data))
    localStorage.setItem("opts", JSON.stringify(globals.opts))
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

    if (item.amount == 0) sortItems(getCategoryFromItem(item.name))
}

function updateAllItems() {
    for (const category of data) {
        for (const item of category.items) updateItem(item)
    }
}

function initializeSite() {
    // localstorage
    const lsData = localStorage.getItem("data")
    const lsOpts = localStorage.getItem("opts")
    if (!lsData) {
        data = []
        alert("Welcome to my ethically made app (no AI) that I made instead of doing thesis (I will fail). To get started, create a new category by clicking on the top there, anyway bye, contact me if you have any issues haha")
    }
    else data = JSON.parse(lsData)
    if (!lsOpts) globals.opts = { editMode: false, totalProfit: 0 }
    else globals.opts = JSON.parse(lsOpts)

    setupDataViews()
    setupPopupForms()
    updateSubtotalDiv()
}

function setupDataViews() {
    globals.mainDiv.innerHTML = ""
    for (const category of data) {
        category.view = createCategoryDiv(category)
        category.itemsHolderDiv = createItemsHolderDiv()

        for (const item of category.items) {
            const itemDiv = createItemDiv(item)
            category.itemsHolderDiv.appendChild(itemDiv)
            item.view = itemDiv
        }

        globals.mainDiv.appendChild(category.view)
        globals.mainDiv.appendChild(category.itemsHolderDiv)
        sortItems(category.name)
    }
}

function getCart() {
    const cart = []
    let subtotal = 0
    let amount = 0
    for (const entry of data) {
        const cartCategory = { name: entry.name, items: [] }
        for (const item of entry.items) {
            if (item.cartTotal > 0) {
                cartCategory.items.push(item)
                subtotal += item.cartTotal * item.price
                amount += item.cartTotal
            }
        }
        if (cartCategory.items.length > 0) cart.push(cartCategory)
    }
    return [cart, subtotal, amount]
}

function startCheckout() {
    const [cart, subtotal, amount] = getCart()
    const summary = getCheckoutSummary(cart, subtotal, amount)
    globals.popup.checkoutSummaryDiv.innerHTML = `<p>${summary}</p>`
    globals.popup.checkoutCheckoutButton.onclick = () => {
        finishCheckout(cart, subtotal)
        emptyCart()
        closeCheckoutPopup()
        uploadToLocalStorage()
    }
    openCheckoutPopup()
}

function finishCheckout(cart, subtotal) {
    globals.opts.totalProfit += subtotal
    for (const category of cart) {
        for (const item of category.items)
            item.amount -= item.cartTotal
    }
}

function getCheckoutSummary(cart, subtotal, amount) {
    let summary = ""

    for (const category of cart) {
        summary += `${category.name}\n`
        for (const item of category.items)
            summary += `\t${item.name} x${item.cartTotal}\n`
    }

    if (!summary) summary = "No items in cart\n"
    summary += `\nSubtotal: ₱${subtotal}\nItems: ${amount}`

    return summary
}

function addItemToCart(name) {
    if (!globals.opts.editMode) {
        const item = getItem(name)
        if (item && item.cartTotal < item.amount) {
            item.cartTotal++
            updateItem(item)
        }
    }
    updateSubtotalDiv()
}

function removeItemFromCart(name) {
    if (!globals.opts.editMode) {
        const item = getItem(name)
        if (item && item.cartTotal > 0) {
            item.cartTotal--
            updateItem(item)
        }
    }
    updateSubtotalDiv()
}

function getCategory(name) {
    const category = data.filter(category => category.name === name)
    if (category.length != 0) return category[0]
    return null
}

function getItem(name) {
    for (const category of data) {
        const item = category.items.filter(item => item.name === name)
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
        sortItems(category.name)
    }
}

function sortItems(categoryName) {
    const category = getCategory(categoryName)
    if (category) {
        category.items.sort((a, b) => {
            if (a.amount <= 0) return 1
            if (b.amount <= 0) return -1

            aName = a.name.toLowerCase()
            bName = b.name.toLowerCase()
            if (aName < bName) {
                return -1;
            }
            if (aName > bName) {
                return 1;
            }
            return 0;
        });
        category.itemsHolderDiv.innerHTML = ""
        // PROBLEM HERE
        for (const item of category.items)
            category.itemsHolderDiv.appendChild(item.view)
    }
}

function addCategory(name, color) {
    if (!getCategory(name)) {
        const category = {
            name,
            color,
            folded: false,
            items: []
        }
        category.view = createCategoryDiv(category)
        category.itemsHolderDiv = createItemsHolderDiv()
        globals.mainDiv.appendChild(category.view)
        globals.mainDiv.appendChild(category.itemsHolderDiv)
        data.push(category)

        updatePopupCategories()
    }
}

function removeItem(name) {
    for (const category of data) {
        const items = category.items
        for (let i = 0; i < items.length; i++) {
            if (items[i].name === name) {
                items[i].view.remove()
                items.splice(i, 1)
                break
            }
        }
    }
}

function removeCategory(name) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].name === name) {
            data[i].view.remove()
            data[i].itemsHolderDiv.remove()
            for (const item of data[i].items)
                item.view.remove()
            data.splice(i, 1)
            break
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
    for (const category of data) {
        category.folded = true
        updateCategory(category)
    }
}

function expandAllCategories() {
    for (const category of data) {
        category.folded = false
        updateCategory(category)
    }
}

function emptyCart() {
    const [cart] = getCart()
    for (const category of cart) {
        category.items.map(item => {
            item.cartTotal = 0
            updateItem(item)
        })
    }
    updateSubtotalDiv()
}

function toggleEditMode() {
    if (globals.opts.editMode)
        globals.header.editModeButton.textContent = "✏️ Edit Mode"
    else
        globals.header.editModeButton.textContent = "👀 Normal Mode"
    globals.opts.editMode = !globals.opts.editMode
    emptyCart()
    updateAllItems()
    updateAllCategories()
}

function closeCheckoutPopup() {
    globals.popup.checkoutPopupDiv.classList.add("closed-popup")
    globals.popup.checkoutSummaryDiv.innerHTML = ""
}

function openCheckoutPopup() {
    globals.popup.checkoutPopupDiv.classList.remove("closed-popup")
}

function openNewItemPopup() {
    globals.popup.newItemPopupDiv.classList.remove("closed-popup")
}

function closeNewItemPopup() {
    globals.popup.newItemPopupDiv.classList.add("closed-popup")
    globals.popup.newItemPopupDiv.querySelectorAll("input")
        .forEach(input => input.value = "")
}

function openEditItemPopup(name) {
    globals.popup.editItemPopupDiv.classList.remove("closed-popup")
}

function closeEditItemPopup() {
    globals.popup.editItemPopupDiv.classList.add("closed-popup")
    globals.popup.editItemPopupDiv.querySelectorAll("input")
        .forEach(input => input.value = "")
}

function openNewCategoryPopup() {
    globals.popup.newCategoryPopupDiv.classList.remove("closed-popup")
}

function closeNewCategoryPopup() {
    globals.popup.newCategoryPopupDiv.classList.add("closed-popup")
    globals.popup.newCategoryPopupDiv.querySelectorAll("input[type=text]")
        .forEach(input => input.value = "")
}

function openEditCategoryPopup(name) {
    globals.popup.editCategoryPopupDiv.classList.remove("closed-popup")
}

function closeEditCategoryPopup() {
    globals.popup.editCategoryPopupDiv.classList.add("closed-popup")
    globals.popup.editCategoryPopupDiv.querySelectorAll("input[type=text]")
        .forEach(input => input.value = "")
}

function openConfirmDeletePopup() {
    globals.popup.confirmDeletePopupDiv.classList.remove("closed-popup")
}

function closeConfirmDeletePopup() {
    globals.popup.confirmDeletePopupDiv.classList.add("closed-popup")
}


function setupPopupForms() {
    globals.popup.newItemPopupDiv.onclick = (e) => {
        if (e.target === globals.popup.newItemPopupDiv) closeNewItemPopup()
    }
    globals.popup.editItemPopupDiv.onclick = (e) => {
        if (e.target === globals.popup.editItemPopupDiv) closeEditItemPopup()
    }
    globals.popup.newCategoryPopupDiv.onclick = (e) => {
        if (e.target === globals.popup.newCategoryPopupDiv) closeNewCategoryPopup()
    }
    globals.popup.editCategoryPopupDiv.onclick = (e) => {
        if (e.target === globals.popup.editCategoryPopupDiv) closeEditCategoryPopup()
    }
    globals.popup.confirmDeletePopupDiv.onclick = (e) => {
        if (e.target === globals.popup.confirmDeletePopupDiv) closeConfirmDeletePopup()
    }
    globals.popup.checkoutPopupDiv.onclick = (e) => {
        if (e.target === globals.popup.checkoutPopupDiv) closeCheckoutPopup()
    }
    globals.popup.newItemForm.onsubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const [name, amount, price, category] = formData.values().map(str => str.trim())
        if (validateItemInputs(name, amount, price)) {
            const chosenCategory = getCategory(category)
            if (chosenCategory) {
                addItem(name, amount, price, category)
                closeNewItemPopup()
                uploadToLocalStorage()
            } else alert("Invalid Category")
        }
    }
    globals.popup.editItemForm.onsubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const [name, amount, price, category, oldName] = formData.values().map(str => str.trim())
        if (validateItemInputs(name, amount, price, oldName)) {
            const chosenCategory = getCategory(category)
            if (chosenCategory) {
                removeItem(oldName)
                addItem(name, amount, price, chosenCategory.name)
                closeEditItemPopup()
                uploadToLocalStorage()
            } else alert("Invalid Category")
        }
    }
    globals.popup.newCategoryForm.onsubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const [name, color] = formData.values().map(str => str.trim())
        if (validateCategoryInputs(name, color)) {
            addCategory(name, color)
            closeNewCategoryPopup()
            uploadToLocalStorage()
        }
    }
    globals.popup.editCategoryForm.onsubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const [name, color, oldName] = formData.values().map(str => str.trim())
        const category = getCategory(oldName)
        if (validateCategoryInputs(name, color, oldName)) {
            category.name = name
            category.color = color
            updateCategory(category)
            closeEditCategoryPopup()
            uploadToLocalStorage()
        }
    }
    updatePopupCategories()
}

function updatePopupCategories() {
    globals.popup.newItemCategorySelect.innerHTML = ""
    globals.popup.editItemCategorySelect.innerHTML = ""

    for (const category of data) {
        const option = document.createElement("option")
        option.value = option.textContent = category.name
        globals.popup.newItemCategorySelect.appendChild(option)
        globals.popup.editItemCategorySelect.appendChild(option.cloneNode(true))
    }
}

function validateCategoryInputs(name, color, oldName = "") {
    if (getCategory(name) && name !== oldName) {
        alert("Category Name Taken")
        return false
    }

    if (!name || !color) {
        alert("Empty Field Found")
        return false
    }

    return true
}

function validateItemInputs(name, amount, price, oldName = "") {
    if (getItem(name) && name !== oldName) {
        alert("Item Name Taken")
        return false
    }

    if (!name || !amount || !price) {
        alert("Empty Field Found")
        return false
    }
    amount = Number(amount)
    price = Number(price)

    if (!Number.isInteger(amount) || amount < 0 ||
        Number.isNaN(price) || price < 0) {
        alert("Invalid Input")
        return false
    }

    return true
}

initializeSite()
