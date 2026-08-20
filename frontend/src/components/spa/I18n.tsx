"use client";

import { createElement, type HTMLAttributes } from "react";
import { useLanguage } from "@/components/spa/LanguageProvider";

type I18nProps = {
  k: string;
  as?: keyof HTMLElementTagNameMap;
} & HTMLAttributes<HTMLElement>;

export function I18n({ k, as = "span", className, ...props }: I18nProps) {
  const { t } = useLanguage();
  return createElement(as, {
    className,
    dangerouslySetInnerHTML: { __html: t(k) },
    ...props,
  });
}
