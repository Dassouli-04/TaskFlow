const DRAFT_KEY = `task_draft_${projectId}`;

function autoSaveDraft() {
  const draft = {
    title: document.getElementById('taskTitle')?.value || '',
    description: document.getElementById('taskDescription')?.value || '',
    priority: document.getElementById('taskPriority')?.value || 'moyenne',
    status: document.getElementById('taskStatus')?.value || 'à faire',
    assignedTo: document.getElementById('assignedTo')?.value || '',
    deadline: document.getElementById('taskDeadline')?.value || '',
    savedAt: new Date().toISOString()
  };
  
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  showAutoSaveNotification();
}

function showAutoSaveNotification() {
  const indicator = document.getElementById('autoSaveIndicator');
  if (indicator) {
    indicator.textContent = 'Brouillon sauvegardé';
    setTimeout(() => {
      indicator.textContent = '';
    }, 2000);
  }
}

function restoreDraft() {
  const saved = localStorage.getItem(DRAFT_KEY);
  if (!saved) return false;
  
  const draft = JSON.parse(saved);
  const confirmRestore = confirm('Un brouillon non sauvegardé existe. Voulez-vous le restaurer ?');
  
  if (confirmRestore) {
    document.getElementById('taskTitle').value = draft.title;
    document.getElementById('taskDescription').value = draft.description;
    document.getElementById('taskPriority').value = draft.priority;
    document.getElementById('taskStatus').value = draft.status;
    if (document.getElementById('assignedTo')) {
      document.getElementById('assignedTo').value = draft.assignedTo;
    }
    document.getElementById('taskDeadline').value = draft.deadline;
    return true;
  }
  
  localStorage.removeItem(DRAFT_KEY);
  return false;
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

// Auto-save on input
document.querySelectorAll('#taskForm input, #taskForm select, #taskForm textarea').forEach(field => {
  field.addEventListener('input', autoSaveDraft);
});

// Clear draft on successful submit
async function submitTaskWithDraftClear() {
  try {
    await submitTask();
    clearDraft();
  } catch (error) {
    console.error('Error submitting task:', error);
  }
}

// Restore draft on page load
document.addEventListener('DOMContentLoaded', () => {
  restoreDraft();
});