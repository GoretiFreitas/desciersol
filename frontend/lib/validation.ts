/**
 * Utilitários de validação de arquivos
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const FILE_SIZE_LIMITS = {
  PDF: 50, // 50MB
  IMAGE: 10, // 10MB
} as const;

export const ACCEPTED_FILE_TYPES = {
  PDF: ['application/pdf'] as string[],
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as string[],
};

/**
 * Valida arquivo PDF
 */
export function validatePDF(file: File): FileValidationResult {
  if (!ACCEPTED_FILE_TYPES.PDF.includes(file.type)) {
    return {
      valid: false,
      error: 'Arquivo deve ser PDF',
    };
  }

  const maxSizeBytes = FILE_SIZE_LIMITS.PDF * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Arquivo PDF muito grande. Máximo: ${FILE_SIZE_LIMITS.PDF}MB`,
    };
  }

  return { valid: true };
}

/**
 * Valida arquivo de imagem
 */
export function validateImage(file: File): FileValidationResult {
  if (!ACCEPTED_FILE_TYPES.IMAGE.includes(file.type)) {
    return {
      valid: false,
      error: 'Imagem deve ser JPG, PNG ou WebP',
    };
  }

  const maxSizeBytes = FILE_SIZE_LIMITS.IMAGE * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Imagem muito grande. Máximo: ${FILE_SIZE_LIMITS.IMAGE}MB`,
    };
  }

  return { valid: true };
}

/**
 * Valida dimensões mínimas de imagem
 */
export function validateImageDimensions(
  file: File,
  minWidth: number,
  minHeight: number
): Promise<FileValidationResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < minWidth || img.height < minHeight) {
          resolve({
            valid: false,
            error: `Imagem deve ter pelo menos ${minWidth}x${minHeight}px`,
          });
        } else {
          resolve({ valid: true });
        }
      };
      img.onerror = () => {
        resolve({
          valid: false,
          error: 'Erro ao carregar imagem',
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Formata tamanho de arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Gera hash SHA-256 de um arquivo (client-side)
 */
export async function calculateFileSHA256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `sha256:${hashHex}`;
}

