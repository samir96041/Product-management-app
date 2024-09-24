import {
  Page,
} from "@shopify/polaris";
import Product from "./Product";
import { useTranslation, Trans } from "react-i18next";
export default function HomePage() {
  const { t } = useTranslation();
  return (
    <Page >
     <Product/>
    </Page>
  );
}
