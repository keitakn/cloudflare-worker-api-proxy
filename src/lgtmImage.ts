export const acceptedTypesImageExtensions = ['.png', '.jpg', '.jpeg'] as const;

export type AcceptedTypesImageExtension =
  typeof acceptedTypesImageExtensions[number];
