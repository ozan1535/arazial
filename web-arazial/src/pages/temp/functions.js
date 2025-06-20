// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateString;
  }
}; 
// Helper to get status text from status code
const getStatusText = (status) => {
  switch (status) {
    case 'active': return 'Aktif';
    case 'upcoming': return 'Yaklaşan';
    case 'completed': return 'Tamamlandı';
    default: return status || '';
  }
}; 
// Handle auction deletion
const handleDeleteAuction = async (auctionId) => {
  if (!window.confirm('Bu ihaleyi silmek istediğinize emin misiniz?')) {
    return;
  }

  try {
    const { error } = await supabase
      .from('auctions')
      .delete()
      .eq('id', auctionId);
      
    if (error) throw error;
    
    fetchSectionData('auctions');
    alert('İhale başarıyla silindi.');
  } catch (error) {
    console.error('Error deleting auction:', error);
    alert('İhale silinirken bir hata oluştu.');
  }
}; 