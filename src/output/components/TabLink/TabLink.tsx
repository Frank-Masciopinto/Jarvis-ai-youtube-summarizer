import React, {MouseEventHandler} from 'react';

type Props = React.PropsWithChildren & React.HTMLProps<HTMLAnchorElement> & {
  url: string;
}

const TabLink: React.FC<Props> = ({children, url, ...props}) => {
  const onClick: MouseEventHandler = (e) => {
    e.stopPropagation();

    chrome.tabs.create({url}).catch((error) => {
      console.error(error);
    });
  }

  return (<a onClick={onClick} {...props}>{children}</a>)
}

export default TabLink;
