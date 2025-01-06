export const simpleHash = (str: string) => {
  return str.split('').reduce((a, b) => {
    return (a + b.charCodeAt(0));
  }, 0).toString(16);
};
