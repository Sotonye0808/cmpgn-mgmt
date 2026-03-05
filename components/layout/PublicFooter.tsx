import AppFooter from "./AppFooter";

/**
 * PublicFooter — shared footer for auth and public (landing) layouts.
 * Thin wrapper around the unified AppFooter (variant="public").
 */
export default function PublicFooter() {
  return <AppFooter variant="public" />;
}
