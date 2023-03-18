// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styled, { CSSObject } from 'styled-components';

export const BaseButton: CSSObject = {
  fontSize: '0.8em',
  textAlign: 'center',
  textDecorationLine: 'underline',
  color: 'darkred',
  fontFamily: 'monospace',
  borderRadius: '1px',
  display: 'block',
  pointerEvents: 'all',
  padding: 0
};

export const _BaseButton = styled.button({
  ...BaseButton
});

export const DelveButton = styled.button({
  ...BaseButton,
  bottom: '5px',
  position: 'absolute',
  display: 'inline-block',
  width: 'max-content',
  margin: 'auto',
  transform: 'translate(-50%, 0%)'
});

export const PassButton = styled.button({
  ...BaseButton,
  position: 'absolute',
  textAlign: 'center',
  textDecorationLine: 'none',
  top: '100%',
  width: '100%'
});

export const HelpButton = styled.button({
  ...BaseButton,
  position: 'absolute',
  right: 0,
  top: 0
});
