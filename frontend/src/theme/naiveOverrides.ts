import type { GlobalThemeOverrides } from 'naive-ui'

export const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#E84057',
    primaryColorHover: '#D63549',
    primaryColorPressed: '#C42D40',
    primaryColorSuppl: '#F06070',
    borderRadius: '12px',
    borderRadiusSmall: '8px',
    borderColor: '#FFE0E0',
    fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    bodyColor: '#FFFFFF',
    cardColor: '#FFFFFF',
    modalColor: '#FFFFFF',
    textColorBase: '#1A1A2E',
    textColor1: '#1A1A2E',
    textColor2: '#6B7280',
    textColor3: '#9CA3AF',
    inputColor: '#FFFFFF',
    hoverColor: '#FFF0F0',
    fontSize: '14px',
  },
  Button: {
    borderRadiusMedium: '12px',
    borderRadiusSmall: '8px',
    borderRadiusLarge: '12px',
    heightMedium: '40px',
    heightLarge: '44px',
    fontSizeMedium: '14px',
    fontSizeLarge: '16px',
  },
  Card: {
    borderRadius: '16px',
    borderColor: '#FFE0E0',
    paddingMedium: '20px',
    color: '#FFFFFF',
  },
  Input: {
    color: '#FFFFFF',
    colorFocus: '#FFFFFF',
    colorDisabled: '#F5F5F5',
    borderRadius: '10px',
    borderHover: '1px solid #E84057',
    borderFocus: '1px solid #E84057',
    heightMedium: '40px',
  },
  Select: {
    peers: {
      InternalSelection: {
        borderRadius: '10px',
        borderHover: '1px solid #E84057',
        borderFocus: '1px solid #E84057',
        heightMedium: '40px',
      },
    },
  },
  DatePicker: {
    itemBorderRadius: '8px',
  },
  Modal: {
    borderRadius: '16px',
  },
  Menu: {
    borderRadius: '10px',
    itemColorActive: '#FFF0F0',
    itemColorActiveHover: '#FFE4E6',
    itemTextColorActive: '#E84057',
    itemTextColorActiveHover: '#D63549',
    itemIconColorActive: '#E84057',
    itemIconColorActiveHover: '#D63549',
    itemColorHover: '#FFF8F8',
    itemTextColorHover: '#E84057',
    itemIconColorHover: '#E84057',
    itemHeight: '44px',
  },
  Tag: {
    borderRadius: '9999px',
  },
  Tabs: {
    tabBorderRadius: '10px',
    colorSegment: '#FFF0F0',
  },
  Rate: {
    colorFilled: '#E84057',
  },
  Message: {
    borderRadius: '12px',
  },
}
