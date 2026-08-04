declare module "@gatsbyjs/reach-router" {
  export function useLocation(): {
    pathname: string
    search: string
    hash: string
  }
}

declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export = classes;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.jpeg" {
  const value: string;
  export default value;
}

declare module "*.svg" {
  const value: string;
  export default value;
}

declare module "*.woff2" {
  const value: string;
  export default value;
}
