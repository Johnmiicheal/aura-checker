// Add error handling and logging
const handleShare = async () => {
  if (getImage) {
    const imageUrl = await getImage();
    if (imageUrl) {
      try {
        const shareUrl = getShareUrl ? getShareUrl() : window.location.href;

        if (navigator.share) {
          const blob = await (await fetch(imageUrl)).blob();
          const file = new File([blob], 'aura-comparison.png', { type: 'image/png' });
          await navigator.share({
            files: [file],
            title: 'Aura Comparison',
            text: 'Check out this Aura Comparison!',
            url: shareUrl
          });
        } else {
          await navigator.clipboard.writeText(shareUrl);
          toast.success('Link copied to clipboard!');
        }
      } catch (error) {
        console.error('Share error:', error)
        toast.error('Download cancelled');
      }
    }
  }
  // ... rest of the function
} 