import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import i18next, { i18n as I18nInstance, InitOptions, TFunction } from 'i18next';
import resources from './resources';

interface I18nContextProps {
	i18n: I18nInstance;
	t: TFunction<'translation', undefined>;
}
if (!i18next.isInitialized) {
	i18next.init({
		lng: 'zh',
		fallbackLng: 'zh',
		resources
	});
}
const I18nContext = createContext<I18nContextProps>({
	i18n: i18next,
	t: i18next.t.bind(i18next)
});

interface I18nProviderProps {
	i18nInstance?: I18nInstance;
	children: ReactNode;
	initOptions?: InitOptions;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ i18nInstance, children, initOptions }) => {
	const i18n = useMemo(() => {
		if (i18nInstance) return i18nInstance;
		if (!i18next.isInitialized) {
			i18next.init({
				lng: 'zh',
				fallbackLng: 'zh',
				resources,
				...initOptions
			});
		}
		return i18next;
	}, [i18nInstance, initOptions]);
	const t = i18n.t.bind(i18n);
	return <I18nContext.Provider value={{ i18n, t }}>{children}</I18nContext.Provider>;
};

export function useI18n() {
	return useContext(I18nContext);
}
