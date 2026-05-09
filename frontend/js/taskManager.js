let currentPage = 1;
let totalPages = 1;
let currentFilters = { status: '', priority: '', assignedTo: '', search: '' };

async function loadTasksWithFilters() {
  try {
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
      page: currentPage,
      limit: 10,
      ...currentFilters
    });
    
    const response = await axios.get(`/api/projects/${projectId}/tasks?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const { data, total, page, totalPages: pages } = response.data;
    totalPages = pages;
    
    displayTasks(data);
    updatePaginationControls();
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

function updatePaginationControls() {
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;
  if (pageInfo) pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
}

function applyFilters() {
  currentFilters = {
    status: document.getElementById('filterStatus')?.value || '',
    priority: document.getElementById('filterPriority')?.value || '',
    assignedTo: document.getElementById('filterAssignedTo')?.value || '',
    search: document.getElementById('searchInput')?.value || ''
  };
  currentPage = 1;
  loadTasksWithFilters();
}

function goToPage(page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  loadTasksWithFilters();
}

