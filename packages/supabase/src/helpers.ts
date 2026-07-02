export const handleSupabaseError = (error: any) => {
  if (error) {
    throw new Error(error.message || JSON.stringify(error));
  }
};
