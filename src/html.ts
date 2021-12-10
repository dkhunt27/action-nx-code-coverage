const tag =
  (name: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (...children: any[]) => {
    const props =
      typeof children[0] === 'object'
        ? Object.keys(children[0])
            .map(key => ` ${key}='${children[0][key]}'`)
            .join('')
        : ''

    const c = typeof children[0] === 'string' ? children : children.slice(1)

    return `<${name}${props}>${c.join('')}</${name}>`
  }

export const details = tag('details')
export const summary = tag('summary')
export const tr = tag('tr')
export const td = tag('td')
export const th = tag('th')
export const b = tag('b')
export const table = tag('table')
export const tbody = tag('tbody')
export const a = tag('a')
export const span = tag('span')

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fragment = (...children: any[]): string => children.join('')
