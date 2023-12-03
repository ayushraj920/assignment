const apiUrl = 'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json';
const itemsPerPage = 10;

let originalData = [];
let currentPage = 1;
let searchTerm = '';
let selectedRows = [];
let selectedAll = false;

async function fetchData() {
    const response = await fetch(apiUrl);
    originalData = await response.json();
    renderUI();
}

function handleCheckboxAll(checkbox) {
    if (checkbox.checked) {
        handleSelectAll();
    } else {
        handleDeselectAll();
    }
}

function renderRows() {
    const filteredData = applySearchFilter();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const rows = filteredData.slice(startIndex, endIndex);

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th><input type="checkbox" onchange="handleCheckboxAll(this)"></th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            ${rows.map(row => `
                <tr data-id="${row.id}" class="${selectedRows.includes(row.id) ? 'selected' : ''}">
                    <td><input type="checkbox" onclick="handleCheckbox('${row.id}')"></td>
                    <td class="editable" contenteditable="false">${row.name}</td>
                    <td class="editable" contenteditable="false">${row.email}</td>
                    <td class="editable" contenteditable="false">${row.role}</td>
                    <td>
                        <span onclick="handleEdit('${row.id}', this)">
                            <i class="fa-regular fa-pen-to-square edit btn"></i>
                        </span>
                        <span onclick="handleDelete('${row.id}')">
                            <i class="fa-regular fa-trash-can delete btn" style="color: #ff0000;"></i>
                        </span>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;

    return table;
}

function renderPagination() {
    const totalPages = Math.ceil(applySearchFilter().length / itemsPerPage);
    const pagination = document.createElement('div');
    pagination.classList.add('pagination');

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
    pagination.innerHTML = `
    <div class='downBtns'>
            <span class='leftText'>
                <span id='numSelRows'>0</span> of ${originalData.length} row(s) selected
            </span>
            <span class='rightText'>
                <span>Page ${currentPage} of ${totalPages}</span>
                <span onclick="goToPage(1)">
                    <i class="fa-solid fa-angles-left dbtn first-page"></i>
                </span>
                <span onclick="goToPage(${currentPage - 1})">
                <i class="fa-solid fa-angle-left dbtn previous-page"></i>
                </span>

            
                ${pageNumbers.map(page => `
                    <button class="dbtn ${currentPage === page ? 'active' : ''}" onclick="goToPage(${page})">${page}</button>
                `).join('')}

                <span onclick=onclick="goToPage(${currentPage + 1})">
                    <i class="fa-solid fa-angle-right dbtn next-page"></i>
                </span>
                <span onclick=onclick="goToPage(${totalPages})">
                    <i class="fa-solid fa-angles-right dbtn last-page"></i>
                </span>
            </span>
        </div>
    `;

    return pagination;
}

function goToPage(page) {
    if (page >= 1 && page <= Math.ceil(applySearchFilter().length / itemsPerPage)) {
        currentPage = page;
        renderUI();
    }
}

function applySearchFilter() {
    return originalData.filter(row =>
        Object.values(row).some(value => value.toLowerCase().includes(searchTerm.toLowerCase()))
    );
}

function handleSearch() {
    searchTerm = document.querySelector('input[type="text"]').value;
    currentPage = 1;
    renderUI();
}

function handleEdit(id, iconElement) {
    const row = originalData.find(item => item.id === id);
    const editableCells = document.querySelectorAll(`tr[data-id="${id}"] .editable`);

    if (!iconElement.classList.contains('editing')) {
        // Enable editing
        editableCells.forEach(cell => {
            cell.contentEditable = true;
            cell.classList.add('editable-active');
        });
        iconElement.classList.add('editing');
        iconElement.innerHTML = '<i class="fa-solid fa-floppy-disk edit btn" style="color: #002461;"></i>';
    } else {
        // Save changes and disable editing
        editableCells.forEach(cell => {
            cell.contentEditable = false;
            cell.classList.remove('editable-active');
            row[cell.dataset.field] = cell.textContent.trim();
        });
        iconElement.classList.remove('editing');
        iconElement.innerHTML = '<i class="fa-regular fa-pen-to-square edit btn"></i>';
    }
}


function handleDelete(id) {
    const confirmed = confirm(`Are you sure you want to delete the user with ID ${id}?`);

    if (confirmed) {
        originalData = originalData.filter(item => item.id !== id);
        selectedRows = selectedRows.filter(selectedId => selectedId !== id);
        renderUI();
    }
}

function handleCheckbox(id) {
    const checkbox = document.querySelector(`tr[data-id="${id}"] input[type="checkbox"]`);
    const row = document.querySelector(`tr[data-id="${id}"]`);
    const size = document.getElementById(`numSelRows`);

    if (checkbox.checked) {
        selectedRows.push(id);
        row.classList.add('selected');
    } else {
        selectedRows = selectedRows.filter(selectedId => selectedId !== id);
        row.classList.remove('selected');
    }
    size.textContent = selectedRows.length;
}

function handleSelectAll() {
    const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
    const size = document.getElementById(`numSelRows`);
    selectedRows = [];
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
        const id = checkbox.closest('tr').dataset.id;
        selectedRows.push(id);
    });
    selectedRows.forEach(id => {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        row.classList.add('selected');
    })
    size.textContent = selectedRows.length;
}

function handleDeselectAll() {
    const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
    const size = document.getElementById(`numSelRows`);
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    selectedRows.forEach(id => {
        const row = document.querySelector(`tr[data-id="${id}"]`);
        row.classList.remove('selected');
    })
    selectedRows = [];
    size.textContent = 0;
}

function renderUI() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search...';
    searchInput.value = searchTerm;

    const searchButton = document.createElement('span');
    searchButton.classList.add('search');
    searchButton.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
    searchButton.addEventListener('click', handleSearch);

    const deleteSelectedButton = document.createElement('span');
    deleteSelectedButton.innerHTML = '<i class="fa-regular fa-trash-can delete btnDelSel" style="color: #ffffff;"></i>';
    deleteSelectedButton.addEventListener('click', handleDeleteSelected);

    const searchInfo = document.createElement('p');
    // searchInfo.textContent = `Search results for: ${searchTerm}`;

    // const selectAllCheckbox = document.createElement('input');
    // selectAllCheckbox.type = 'checkbox';
   

    const table = renderRows();
    const pagination = renderPagination();

    app.appendChild(searchInput);
    app.appendChild(searchButton);
    app.appendChild(deleteSelectedButton);
    app.appendChild(searchInfo);
    // app.appendChild(selectAllCheckbox);
    // app.appendChild(document.createTextNode(' Select All'));
    app.appendChild(table);
    app.appendChild(pagination);
}

function handleDeleteSelected() {
    const confirmed = confirm('Are you sure you want to delete the selected rows?');

    if (confirmed) {
        originalData = originalData.filter(item => !selectedRows.includes(item.id));
        selectedRows = [];
        renderUI();
    }
}

fetchData();
