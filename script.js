let responseData = [];
let currentLength = 10;
let categoryData = ["jewelery", 'electronics', "men's clothing", "women's clothing"];
let selectedCategories = [];

// Initializing event listeners after DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    const menuIcon = document.querySelector('.menu-icon');
    const navLinks = document.querySelector('.nav-links');

    menuIcon.addEventListener('click', () => {
        navLinks.classList.toggle('show');
        menuIcon.classList.toggle('open');
    });

    document.querySelector('.loadMoreButton').addEventListener('click', loadMoreData);
    document.querySelector('.loadLessButton').addEventListener('click', loadLessData);

    categoryCheckBoxUI();
    document.querySelectorAll('.checkboxInput').forEach(checkbox => {
        checkbox.addEventListener('change', handleCategoryChange);
    });

    document.getElementById('searchInput').addEventListener('input', filterAndSortData);
});


// Fetch Products API
fetch('https://fakestoreapi.com/products')
    .then((res) => res.json())
    .then((response) => {
        responseData = [...response];
        showProductsCard(responseData, currentLength);
        getResults(responseData.slice(0, currentLength)?.length);
        updateButtonVisibility(response);
    })
    .catch((error) => {
        console.error('Error fetching products:', error);
    });


// Fetching results length
const getResults = (length) => {
    const resultElement = document.querySelector('.resultsLabel');
    const resultData = `${length} ${length > 1 ? 'results' : 'result'}`;
    resultElement.innerHTML = resultData;
};

const showSkeletonLoader = () => {
    const productsCard = document.querySelector('.productsCardContainer');
    productsCard.innerHTML = ''; // Clear previous content
    for (let i = 0; i <= 10; i++) {
        const skeletonElement = document.createElement('div');
        skeletonElement.classList.add('productCards', 'skeleton');
        skeletonElement.innerHTML = `
            <div class='productImageContainer skeleton'></div>
            <div class='productTitle skeleton'></div>
            <div class='priceValue skeleton'></div>
            <div class='description skeleton'></div>
        `;
        productsCard.append(skeletonElement);
    }

};

const hideSkeletonLoader = () => {
    const productsCard = document.querySelector('.productsCardContainer');
    productsCard.innerHTML = ''; // Clear skeleton loader
};



// Fetching ProductsCard
const showProductsCard = (data, length) => {
    showSkeletonLoader();

    // Mimic a delay to show the skeleton loader for a short period
    setTimeout(() => {
        const productsCard = document.querySelector('.productsCardContainer');
        productsCard.innerHTML = ''; // Clear previous content
        hideSkeletonLoader();
        if (data.length) {
            data.slice(0, length).forEach((item) => {
                const truncatedDescription = item.description.length > 100 ? item.description.slice(0, 100) + '...' : item.description;
                const isTruncated = item.description.length > 100;

                const productElement = document.createElement('div');
                productElement.classList.add('productCards');
                productElement.innerHTML = `
                    <div class='productImageContainer'>
                        <img src=${item.image} alt='product' loading='lazy' class='productImage'/>
                    </div>
                    <div class="productTitle">${item.title}</div>
                    <div class="priceValue">$ ${item.price}</div>
                    <div class='description'>
                        <span class='descriptionText' data-full="${item.description}" data-truncated="${truncatedDescription}">${truncatedDescription}</span>
                        ${isTruncated ? `<button class='toggleDescriptionButton'>Show More</button>` : ''}
                    </div>
                `;
                productsCard.append(productElement);
            });

            document.querySelectorAll('.toggleDescriptionButton').forEach(button => {
                button.addEventListener('click', toggleDescription);
            });
        } else {
            const noDataElement = document.createElement('div');
            noDataElement.classList.add('noData');
            noDataElement.innerText = 'No Data Found';
            productsCard.append(noDataElement);
        }
        updateButtonVisibility(data);
    }, 1000); // Adjust the delay time as needed
};



const toggleDescription = (event) => {
    const button = event.target;
    const descriptionText = button.previousElementSibling;
    const isExpanded = button.textContent === 'Show Less';

    if (isExpanded) {
        descriptionText.textContent = descriptionText.getAttribute('data-truncated');
        button.textContent = 'Show More';
    } else {
        descriptionText.setAttribute('data-truncated', descriptionText.textContent);
        descriptionText.textContent = descriptionText.getAttribute('data-full');
        button.textContent = 'Show Less';
    }
};


// Load More Data
const loadMoreData = () => {
    if (currentLength + 10 <= responseData.length) {
        currentLength += 10;
    } else {
        currentLength = responseData.length;
    }
    filterAndSortData();
};

// Load Less Data
const loadLessData = () => {
    if (currentLength - 10 >= 10) {
        currentLength -= 10;
    } else {
        currentLength = 10;
    }
    filterAndSortData();
};

// Update the visibility of Load More and Load Less buttons
const updateButtonVisibility = (data) => {
    const loadMoreButton = document.querySelector('.loadMoreButton');
    const loadLessButton = document.querySelector('.loadLessButton');

    if (data.length <= 10) {
        loadMoreButton.style.display = 'none';
    } else if (currentLength >= data.length) {
        loadMoreButton.style.display = 'none';
    } else {
        loadMoreButton.style.display = 'block';
    }

    if (currentLength <= 10) {
        loadLessButton.style.display = 'none';
    } else {
        loadLessButton.style.display = 'block';
    }
};

// Sort Products Data
const sortProductsData = () => {
    const sortValue = document.getElementById('selectValue').value;
    filterAndSortData(sortValue);
};

// Filter and Sort Data
const filterAndSortData = (sortValue = '') => {
    showSkeletonLoader()
    let filteredData = [...responseData];
    const searchQuery = document.getElementById('searchInput').value.trim().toLowerCase();
    if (searchQuery !== '') {
        filteredData = filteredData.filter(item => {
            return item.title.toLowerCase().includes(searchQuery);
        });
    }

    if (selectedCategories.length > 0) {
        filteredData = filteredData.filter(item => selectedCategories.includes(item.category));
    }

    if (sortValue === 'price') {
        filteredData.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'title') {
        filteredData.sort((a, b) => a.title.localeCompare(b.title));
    }
    hideSkeletonLoader() // Hide skeleton loader
    showProductsCard(filteredData, currentLength);
    getResults(filteredData?.length - currentLength);
    updateButtonVisibility(filteredData)
};

// Handle category change
const handleCategoryChange = (event) => {
    const { name, checked } = event.target;
    if (checked) {
        selectedCategories.push(name);
    } else {
        selectedCategories = selectedCategories.filter(category => category !== name);
    }
    filterAndSortData(document.getElementById('selectValue').value);
};

// Category Checkbox UI
const categoryCheckBoxUI = () => {
    const filterCheckBox = document.querySelector('.filterOptionsContainer');

    categoryData.forEach((item) => {
        const checkboxContainer = document.createElement('div');
        checkboxContainer.classList.add('checkBoxLabelContainer');
        checkboxContainer.innerHTML = `
            <input type="checkbox" name="${item}" id="${item}" class="checkboxInput"/>
            <label for="${item}">${item.toUpperCase()}</label>
        `;
        filterCheckBox.append(checkboxContainer);
    });
};
