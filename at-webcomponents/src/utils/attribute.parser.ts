export type SupportedTypes = 'Array' | 'Number' | 'String' | 'Boolean' | 'Date';

export const Converters: Record<SupportedTypes, (value: any) => any> = {
  Array: (va) => (va instanceof Array ? va : JSON.parse(va)),
  Boolean: (va) => ['checked', 'true', ''].includes(va),
  Date: (va) => (va instanceof Date ? va : new Date(va)),
  Number: (va) => (typeof va === 'number' ? va : parseFloat(va)),
  String: (va) => va?.toString() ?? '',
};

export function parseAttribute(
  value: any,
  type: Extract<SupportedTypes, 'Array'>
): any[];
export function parseAttribute(
  value: any,
  type: Extract<SupportedTypes, 'Number'>
): number;
export function parseAttribute(
  value: any,
  type: Extract<SupportedTypes, 'String'>
): string;
export function parseAttribute(
  value: any,
  type: Extract<SupportedTypes, 'Boolean'>
): boolean;
export function parseAttribute(
  value: any,
  type: Extract<SupportedTypes, 'Date'>
): Date;
export function parseAttribute(value: any, type: SupportedTypes) {
  const convFn = Converters[type] ?? ((v) => v);
  const converted = convFn(value);
  return converted;
}
