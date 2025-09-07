/**
 * Utilitaires pour gérer l'encodage UTF-8 et prévenir les problèmes d'accents
 */

/**
 * Nettoie et valide une chaîne pour s'assurer qu'elle est correctement encodée en UTF-8
 * @param {string} text - Le texte à nettoyer
 * @returns {string} - Le texte nettoyé et validé
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Remplacer les caractères d'encodage corrompus courants
  const corrections = {
    'Ã©': 'é',
    'Ã¨': 'è',
    'Ã ': 'à',
    'Ã§': 'ç',
    'Ã´': 'ô',
    'Ã¢': 'â',
    'Ã®': 'î',
    'Ã¯': 'ï',
    'Ã¹': 'ù',
    'Ã»': 'û',
    'Ã«': 'ë',
    'Ã¶': 'ö',
    'Ã¼': 'ü',
    'Ã±': 'ñ',
    'Ã': 'À',
    'Ã‰': 'É',
    'Ã‡': 'Ç',
    '�': '' // Supprimer les caractères de remplacement
  };
  
  let cleanText = text;
  
  // Appliquer les corrections
  Object.entries(corrections).forEach(([corrupted, correct]) => {
    cleanText = cleanText.replace(new RegExp(corrupted, 'g'), correct);
  });
  
  // Normaliser les espaces
  cleanText = cleanText.trim().replace(/\s+/g, ' ');
  
  return cleanText;
}

/**
 * Valide qu'une chaîne ne contient pas de caractères d'encodage corrompus
 * @param {string} text - Le texte à valider
 * @returns {boolean} - true si le texte est valide, false sinon
 */
export function isValidEncoding(text) {
  if (!text || typeof text !== 'string') {
    return true;
  }
  
  // Vérifier uniquement la présence de caractères d'encodage corrompus spécifiques
  const corruptedPatterns = [
    /Ã[©¨ §ôâîïù»«¶¼±]/g, // Caractères UTF-8 mal encodés (double encodage)
    /�/g, // Caractère de remplacement Unicode
    /Ã‰/g, // É mal encodé
    /Ã¨/g, // è mal encodé
    /Ã /g, // à mal encodé
    /Ã´/g, // ô mal encodé
    /Ã¢/g, // â mal encodé
    /Ãª/g, // ê mal encodé
    /Ã®/g, // î mal encodé
    /Ã¯/g, // ï mal encodé
    /Ã¹/g, // ù mal encodé
    /Ã§/g  // ç mal encodé
  ];
  
  return !corruptedPatterns.some(pattern => pattern.test(text));
}

/**
 * Prépare un objet de données avant insertion en base de données
 * @param {Object} data - L'objet contenant les données
 * @returns {Object} - L'objet avec les chaînes nettoyées
 */
export function sanitizeDataForDB(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  const sanitized = { ...data };
  
  // Nettoyer récursivement toutes les chaînes
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeText(sanitized[key]);
    } else if (Array.isArray(sanitized[key])) {
      sanitized[key] = sanitized[key].map(item => 
        typeof item === 'string' ? sanitizeText(item) : sanitizeDataForDB(item)
      );
    } else if (sanitized[key] && typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeDataForDB(sanitized[key]);
    }
  });
  
  return sanitized;
}

/**
 * Middleware pour valider l'encodage des données avant insertion
 * @param {Object} data - Les données à valider
 * @throws {Error} - Si des problèmes d'encodage sont détectés
 */
export function validateEncodingBeforeInsert(data) {
  const errors = [];
  
  function checkObject(obj, path = '') {
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'string') {
        if (!isValidEncoding(value)) {
          errors.push(`Problème d'encodage détecté dans ${currentPath}: "${value}"`);
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => {
          if (typeof item === 'string' && !isValidEncoding(item)) {
            errors.push(`Problème d'encodage détecté dans ${currentPath}[${index}]: "${item}"`);
          } else if (item && typeof item === 'object') {
            checkObject(item, `${currentPath}[${index}]`);
          }
        });
      } else if (value && typeof value === 'object') {
        checkObject(value, currentPath);
      }
    });
  }
  
  if (data && typeof data === 'object') {
    checkObject(data);
  }
  
  if (errors.length > 0) {
    throw new Error(`Erreurs d'encodage détectées:\n${errors.join('\n')}`);
  }
}

/**
 * Exemples d'utilisation pour les tâches et documents courants
 */
export const commonTaskNames = {
  'carnet-signe': 'Carnet signé',
  'remise-photo': 'Remise photo',
  'autorisation-sortie': 'Autorisation sortie',
  'cotisation-fse': 'Cotisation FSE'
};

export const commonDocumentNames = {
  'fiche-renseignements': 'Fiche de renseignements',
  'evasco': 'Evasco',
  'assurance-scolaire': 'Assurance scolaire',
  'fse': 'FSE'
};

/**
 * Fonction helper pour créer des tâches avec encodage correct
 * @param {string} name - Nom de la tâche
 * @param {string} description - Description de la tâche
 * @returns {Object} - Objet tâche avec encodage validé
 */
export function createTaskData(name, description) {
  const taskData = {
    name: sanitizeText(name),
    description: sanitizeText(description)
  };
  
  validateEncodingBeforeInsert(taskData);
  return taskData;
}

/**
 * Fonction helper pour créer des documents avec encodage correct
 * @param {string} name - Nom du document
 * @param {string} description - Description du document
 * @returns {Object} - Objet document avec encodage validé
 */
export function createDocumentData(name, description) {
  const docData = {
    name: sanitizeText(name),
    description: sanitizeText(description)
  };
  
  validateEncodingBeforeInsert(docData);
  return docData;
}