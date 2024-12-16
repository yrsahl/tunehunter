import { Locales } from "@/helpers/lang";
import useLanguageSettings from "@/hooks/settings/useLanguageSettings";
import useDeviceSize from "@/hooks/useDeviceSize";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

const LanguagePicker = () => {
  const router = useRouter();
  const { isSmallDevice } = useDeviceSize();
  const { t } = useTranslation("");
  const { preferredLanguage, changeLanguage } = useLanguageSettings();

  const placeholderValue = isSmallDevice ? "EN" : t(`lang.${router.locale}`);
  const getLanguageText = (locale: string) =>
    isSmallDevice ? locale.toUpperCase() : t(`lang.${locale}`);

  return (
    <Select onValueChange={changeLanguage} value={preferredLanguage || router.locale}>
      <SelectTrigger className="h-[50px] w-20 border-[1px] border-foreground/30 md:w-32">
        <SelectValue placeholder={placeholderValue} />
      </SelectTrigger>
      <SelectContent>
        {Locales.map((locale) => (
          <SelectItem key={locale} value={locale} className="py-2">
            {getLanguageText(locale)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguagePicker;
