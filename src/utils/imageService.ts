/**
 * Service centralisé pour gérer les URLs d'images
 */

const API_BASE_URL = 'https://www.ggdanceacademy.com';

export const imageService = {
  /**
   * Convertit une URL d'image relative en URL absolue
   */
  getUrl: (imageUrl: string | null | undefined): string => {
    if (!imageUrl) {
      return '';
    }

    // Si l'URL commence par http/https, la retourner telle quelle
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Si l'URL commence par /, ajouter le domaine
    if (imageUrl.startsWith('/')) {
      return `${API_BASE_URL}${imageUrl}`;
    }

    // Sinon, retourner l'URL telle quelle
    return imageUrl;
  },

  /**
   * Génère un avatar placeholder
   */
  getAvatarPlaceholder: (name: string, gender?: 'M' | 'F'): string => {
    const color = gender === 'F' ? 'ec4899' : '3b82f6';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&bold=true&size=200`;
  },
};
