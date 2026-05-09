async function inviteMember(projectId, email) {
  try {
    const token = localStorage.getItem('token');
    await axios.post(`/api/projects/${projectId}/members`, { email }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('Membre invité avec succès');
    loadMembersList(projectId);
  } catch (error) {
    alert(error.response?.data?.message || 'Erreur lors de l\'invitation');
  }
}

async function removeMember(projectId, memberId) {
  if (!confirm('Retirer ce membre ?')) return;
  
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`/api/projects/${projectId}/members/${memberId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert('Membre retiré');
    loadMembersList(projectId);
  } catch (error) {
    alert(error.response?.data?.message || 'Erreur');
  }
}