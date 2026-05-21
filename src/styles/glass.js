import { css } from 'styled-components';

/** Reduz blur de vidro no mobile — principal gargalo de GPU */
export const mobileGlassFix = css`
  @media (max-width: 768px) {
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
`;

export const mobileSolidPanel = css`
  @media (max-width: 768px) {
    background: rgba(18, 18, 22, 0.96);
  }
`;
