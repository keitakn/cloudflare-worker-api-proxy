export const acceptedTypesImageExtensions = ['.png', '.jpg', '.jpeg'] as const;

export type AcceptedTypesImageExtension =
  typeof acceptedTypesImageExtensions[number];

type LgtmImageUrl = `https://${string}`;

export type LgtmImage = { id: number; imageUrl: LgtmImageUrl };
