'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  accept: string;
  maxSize?: number; // em MB
  onFileSelect: (file: File | null) => void;
  value?: File | null;
  disabled?: boolean;
  label?: string;
  description?: string;
  showPreview?: boolean;
  className?: string;
}

export function FileUpload({
  accept,
  maxSize = 10,
  onFileSelect,
  value,
  disabled = false,
  label,
  description,
  showPreview = true,
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validar tipo
    const acceptedTypes = accept.split(',').map(t => t.trim());
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    const fileType = file.type;
    
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type;
      }
      return fileType.match(new RegExp(type.replace('*', '.*')));
    });

    if (!isValidType) {
      return `Tipo de arquivo não suportado. Aceitos: ${accept}`;
    }

    // Validar tamanho
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Arquivo muito grande. Tamanho máximo: ${maxSize}MB`;
    }

    return null;
  };

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    onFileSelect(file);

    // Criar preview para imagens
    if (file.type.startsWith('image/') && showPreview) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview('');
    }
  }, [maxSize, accept, showPreview, onFileSelect]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [disabled, handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (disabled) return;

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [disabled, handleFile]);

  const handleRemove = () => {
    setError('');
    setPreview('');
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const isImage = value?.type.startsWith('image/');
  const isPDF = value?.type === 'application/pdf';

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-900 dark:text-white">
          {label}
        </label>
      )}
      
      {description && (
        <p className="text-sm text-slate-700 dark:text-slate-200">{description}</p>
      )}

      {!value ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center w-full h-32 px-4 py-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer',
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <Upload className="w-8 h-8 mb-2 text-slate-600 dark:text-slate-300" />
          <p className="text-sm text-slate-700 dark:text-slate-200 text-center">
            <span className="font-semibold text-slate-900 dark:text-white">Clique para fazer upload</span> ou arraste o arquivo aqui
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            {accept} (máx. {maxSize}MB)
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
          {showPreview && preview ? (
            <img
              src={preview}
              alt="Preview"
              className="w-16 h-16 object-cover rounded"
            />
          ) : isImage ? (
            <ImageIcon className="w-10 h-10 text-slate-600 dark:text-slate-300" />
          ) : isPDF ? (
            <FileText className="w-10 h-10 text-slate-600 dark:text-slate-300" />
          ) : (
            <FileText className="w-10 h-10 text-slate-600 dark:text-slate-300" />
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-slate-900 dark:text-white">{value.name}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {(value.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={disabled}
            className="shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      )}
    </div>
  );
}

