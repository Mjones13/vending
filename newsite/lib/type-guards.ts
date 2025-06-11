/**
 * Type guard utilities for runtime type validation
 * Used to safely validate external data sources and API responses
 */

// Basic type guards
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

// API Response type guards
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export function isApiResponse(value: unknown): value is ApiResponse {
  if (!isObject(value)) {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  return isBoolean(obj.success);
}

export function isApiResponseWithData<T>(
  value: unknown,
  dataValidator?: (data: unknown) => data is T
): value is ApiResponse<T> {
  if (!isApiResponse(value)) {
    return false;
  }
  
  if (value.data !== undefined && dataValidator) {
    return dataValidator(value.data);
  }
  
  return true;
}

// Form data type guards
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  phone?: string;
  company?: string;
}

export function isContactFormData(value: unknown): value is ContactFormData {
  if (!isObject(value)) {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  // Required fields
  if (!isString(obj.name) || !isString(obj.email) || !isString(obj.message)) {
    return false;
  }
  
  // Optional fields validation
  if (obj.phone !== undefined && !isString(obj.phone)) {
    return false;
  }
  
  if (obj.company !== undefined && !isString(obj.company)) {
    return false;
  }
  
  return true;
}

// Email validation type guard
export function isValidEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

// Phone number validation type guard  
export function isValidPhoneNumber(value: string): boolean {
  // Basic phone number validation (digits, spaces, dashes, parentheses)
  const phoneRegex = /^[\d\s\-\(\)\+\.]+$/;
  return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
}

// Product data type guard (for future API responses)
export interface ProductData {
  id: string | number;
  name: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
}

export function isProductData(value: unknown): value is ProductData {
  if (!isObject(value)) {
    return false;
  }
  
  const obj = value as Record<string, unknown>;
  
  // Required fields
  if (!((isString(obj.id) || isNumber(obj.id)) && isString(obj.name))) {
    return false;
  }
  
  // Optional fields validation
  if (obj.description !== undefined && !isString(obj.description)) {
    return false;
  }
  
  if (obj.price !== undefined && !isNumber(obj.price)) {
    return false;
  }
  
  if (obj.image !== undefined && !isString(obj.image)) {
    return false;
  }
  
  if (obj.category !== undefined && !isString(obj.category)) {
    return false;
  }
  
  return true;
}

// Array validation helper
export function isArrayOf<T>(
  value: unknown,
  itemValidator: (item: unknown) => item is T
): value is T[] {
  if (!isArray(value)) {
    return false;
  }
  
  return value.every(itemValidator);
}

// Generic validation helper for optional properties
export function validateOptional<T>(
  value: unknown,
  validator: (value: unknown) => value is T
): value is T | undefined {
  return value === undefined || validator(value);
}