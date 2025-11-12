import localFont from 'next/font/local'

export const montserrat = localFont({
  src: [
    {
      path: './Montserrat-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './Montserrat-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './Montserrat-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: './Montserrat-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-montserrat',
})

export const tanHeadline = localFont({
  src: './TAN-HEADLINE.ttf',
  variable: '--font-tan-headline',
  weight: '700',
})