import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { urls } from '../../../../shared/constants';
import { useAppContext } from '../../../context';
import { useHistory } from '../../../lib/history';
import {
  StyledAtmosphere,
  StyledBrand,
  StyledBrandTld,
  StyledCtaGroup,
  StyledFadeBottom,
  StyledFadeTop,
  StyledGhostButton,
  StyledHeader,
  StyledHero,
  StyledHint,
  StyledHintArrow,
  StyledHintCheck,
  StyledKicker,
  StyledPrimaryButton,
  StyledRoot,
  StyledScrollBody,
  StyledScrollInner,
  StyledScrollWrap,
  StyledSection,
  StyledSectionBigHeadline,
  StyledSectionDivider,
  StyledSectionHeading,
  StyledSectionParagraph,
  StyledStep,
  StyledStepNumber,
  StyledTitle,
  StyledTitleAccent,
  StyledTrack,
  StyledTrackBar,
} from './PrivacyDisclaimerStyles';

// Threshold (0..1) of scroll progress that counts as "read all" — enables
// the accept button + flips the hint to its done state. 0.92 so the user
// doesn't need to land exactly at the bottom pixel, which feels finicky.
const READ_THRESHOLD = 0.92;

// Minimum visible-track height as a percentage. Prevents the cyan bar from
// shrinking into a single pixel on very tall content.
const MIN_TRACK_HEIGHT = 18;

// Wizard steps. We hardcode the union (instead of a number) so the compiler
// catches stray transitions like `setStep(3)` or a missing case in a switch.
type WizardStep = 1 | 2;
const TOTAL_STEPS = 2;

// Step-level metadata that drives the header counter, eyebrow + h1.
const STEP_META: Record<
  WizardStep,
  { headerLabel: string; kicker: string; titleLead: string; titleAccent: string }
> = {
  1: {
    headerLabel: 'Privacidade',
    kicker: 'Aviso de privacidade · primeiro acesso',
    titleLead: 'Antes da gente ',
    titleAccent: 'começar.',
  },
  2: {
    headerLabel: 'Termos & LGPD',
    kicker: 'Termos de uso · proteção de dados',
    titleLead: 'Como a gente trata ',
    titleAccent: 'seus dados.',
  },
};

export function PrivacyDisclaimerView() {
  const { openUrl, setHasAcceptedPrivacyDisclaimer, createNewAccount } = useAppContext();
  const { location } = useHistory();

  // The intent is forwarded from LoginView when the user pressed "Criar conta".
  // We snapshot it once on mount so a downstream replace() of the same route
  // (which would clear the state) doesn't change the final-step CTA mid-flow.
  // Cast through unknown because the `location.state` shape comes through
  // react-router as `LocationState`; we widen explicitly.
  const intent = useMemo<'create-account' | undefined>(
    () => (location.state?.intent === 'create-account' ? 'create-account' : undefined),
    // We intentionally read only on first render; subsequent state writes
    // (scrollPosition etc) shouldn't reset the wizard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  // `hasReadAll` is per-step: each new step starts as "unread" and only
  // unlocks its CTA after the user scrolls through it.
  const [hasReadAll, setHasReadAll] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [trackBar, setTrackBar] = useState({ top: 0, height: MIN_TRACK_HEIGHT });
  const [showFadeTop, setShowFadeTop] = useState(false);
  const [showFadeBottom, setShowFadeBottom] = useState(true);

  // When the user advances a step, scroll the inner card back to the top so
  // the new content starts at the beginning. Also re-arms the read-tracking
  // (`hasReadAll: false`, top fade hidden, bottom fade shown).
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    setHasReadAll(false);
    setTrackBar({ top: 0, height: MIN_TRACK_HEIGHT });
    setShowFadeTop(false);
    setShowFadeBottom(true);
  }, [currentStep]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll <= 0 ? 1 : scrollTop / maxScroll;
    const visibleRatio = clientHeight / scrollHeight;
    const trackHeight = Math.max(MIN_TRACK_HEIGHT, Math.min(100, visibleRatio * 100));
    const trackTop = Math.min(100 - trackHeight, progress * (100 - trackHeight));

    setTrackBar({ top: trackTop, height: trackHeight });
    setShowFadeTop(scrollTop > 4);
    setShowFadeBottom(scrollTop < maxScroll - 4);

    if (progress >= READ_THRESHOLD) {
      setHasReadAll(true);
    }
  }, []);

  // If the card is shorter than the viewport (e.g. step 2 with fewer
  // paragraphs on a tall window), scrollHeight === clientHeight and the
  // user can't actually scroll — so we never hit READ_THRESHOLD. Unlock
  // the CTA proactively when there's nothing to scroll.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight <= el.clientHeight + 1) {
      setHasReadAll(true);
      setShowFadeBottom(false);
    }
  }, [currentStep]);

  const handleAdvance = useCallback(() => {
    if (!hasReadAll) return;
    setCurrentStep((prev) =>
      prev === TOTAL_STEPS ? prev : ((prev + 1) as WizardStep),
    );
  }, [hasReadAll]);

  // Final step CTA. Two behaviors based on `intent`:
  //   - create-account: provision a fresh account on accept (matches the
  //     "Criar conta" flow the user kicked off from LoginView)
  //   - default      : just flip the accepted flag and let
  //     `StateTriggeredNavigation` route to main/welcome/expired.
  // We never push/pop here — owning routing on the navigation base means
  // we don't duplicate that logic per CTA. We also DON'T clear the
  // `pendingCreateAccount` flag here — the navigation gate releases it
  // naturally once `loginState.type === 'ok'`, so the user stays pinned on
  // the disclaimer view through the brief 'logging in' window instead of
  // flashing back to /login. A LOGGED_OUT later clears the stale flag.
  const handleFinalAccept = useCallback(() => {
    if (!hasReadAll) return;
    setHasAcceptedPrivacyDisclaimer(true);
    if (intent === 'create-account') {
      createNewAccount();
    }
  }, [hasReadAll, intent, createNewAccount, setHasAcceptedPrivacyDisclaimer]);

  const handlePrimaryClick = useCallback(() => {
    if (currentStep === TOTAL_STEPS) {
      handleFinalAccept();
    } else {
      handleAdvance();
    }
  }, [currentStep, handleAdvance, handleFinalAccept]);

  const handleOpenPolicy = useCallback(() => {
    void openUrl(urls.privacyGuide);
  }, [openUrl]);

  const meta = STEP_META[currentStep];

  const primaryLabel =
    currentStep === TOTAL_STEPS
      ? intent === 'create-account'
        ? 'Aceitar e criar conta'
        : 'Aceitar e começar'
      : 'Aceitar e continuar';

  return (
    <StyledRoot>
      <StyledAtmosphere aria-hidden />

      <StyledHeader>
        <StyledBrand>
          VPN<StyledBrandTld>.vu</StyledBrandTld>
        </StyledBrand>
        <StyledStep>
          <StyledStepNumber>{currentStep}</StyledStepNumber> de {TOTAL_STEPS} ·{' '}
          {meta.headerLabel}
        </StyledStep>
      </StyledHeader>

      <StyledHero>
        <StyledKicker>{meta.kicker}</StyledKicker>
        <StyledTitle>
          {meta.titleLead}
          <StyledTitleAccent>{meta.titleAccent}</StyledTitleAccent>
        </StyledTitle>
      </StyledHero>

      <StyledScrollWrap>
        <StyledScrollBody>
          <StyledFadeTop $visible={showFadeTop} aria-hidden />
          <StyledFadeBottom $visible={showFadeBottom} aria-hidden />
          {/*
            We remount the scroll inner per-step (key={currentStep}) so React
            tears down + rebuilds the children — that way the staggered fade-in
            animations on sections (if added later) re-trigger and the imperative
            scrollTop reset stays in sync with the new content's measured height.
          */}
          <StyledScrollInner ref={scrollRef} onScroll={handleScroll} key={currentStep}>
            {currentStep === 1 && <PrivacyStepContent />}
            {currentStep === 2 && <TermsStepContent />}
          </StyledScrollInner>
        </StyledScrollBody>
        <StyledTrack>
          <StyledTrackBar $top={trackBar.top} $height={trackBar.height} />
        </StyledTrack>
      </StyledScrollWrap>

      <StyledHint $done={hasReadAll}>
        {hasReadAll ? (
          <>
            <StyledHintCheck>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="11"
                height="11">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </StyledHintCheck>
            <span>Você leu tudo</span>
          </>
        ) : (
          <>
            <span>Role pra ler tudo</span>
            <StyledHintArrow>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="16"
                height="16">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </StyledHintArrow>
          </>
        )}
      </StyledHint>

      <StyledCtaGroup>
        <StyledPrimaryButton
          type="button"
          $enabled={hasReadAll}
          disabled={!hasReadAll}
          onClick={handlePrimaryClick}>
          {primaryLabel}
        </StyledPrimaryButton>
        {/*
          The "Política completa" ghost button is only meaningful on step 1
          (the privacy overview). Hiding it on later steps keeps the CTA
          column focused — step 3 has its own opt-in toggle directly above.
        */}
        {currentStep === 1 && (
          <StyledGhostButton type="button" onClick={handleOpenPolicy}>
            Política completa
          </StyledGhostButton>
        )}
      </StyledCtaGroup>
    </StyledRoot>
  );
}

// =============================================================================
// STEP 1 · Privacy overview (unchanged from the original single-step view)
// =============================================================================

function PrivacyStepContent() {
  return (
    <>
      <StyledSection>
        <StyledSectionHeading>O essencial</StyledSectionHeading>
        <StyledSectionParagraph>
          A VPN.vu foi desenhada pra <strong>não saber quem é você.</strong> Sem e-mail, sem
          senha, sem nome. Você abre o app e usa.
        </StyledSectionParagraph>
      </StyledSection>

      <StyledSection>
        <StyledSectionHeading>Política no-logs</StyledSectionHeading>
        <StyledSectionParagraph>
          Não guardamos histórico, IP, DNS query, timestamp de sessão, nem nada que ligue
          tráfego à conta. Nossos servidores rodam em RAM e zeram a cada reboot.
        </StyledSectionParagraph>
      </StyledSection>

      <StyledSection>
        <StyledSectionHeading>Criptografia</StyledSectionHeading>
        <StyledSectionParagraph>
          Toda conexão usa WireGuard com curve25519. As chaves são geradas no seu dispositivo
          e nunca saem dele em claro.
        </StyledSectionParagraph>
      </StyledSection>

      <StyledSection>
        <StyledSectionHeading>Dados que coletamos</StyledSectionHeading>
        <StyledSectionBigHeadline>
          <span className="positive">Nenhum.</span>
        </StyledSectionBigHeadline>
        <StyledSectionParagraph>
          Sério. Não pedimos e-mail, telefone, nome, CPF, endereço, foto de perfil, idade,
          gênero, localização ou qualquer outra coisa que ligue você a uma identidade.
        </StyledSectionParagraph>
      </StyledSection>

      <StyledSection>
        <StyledSectionHeading>Identificação interna</StyledSectionHeading>
        <StyledSectionParagraph>
          Sua conta é um <strong>número de 16 dígitos</strong> gerado aleatoriamente no
          primeiro uso. Anota ele em algum lugar seguro · se perder, não tem como recuperar
          (porque nem a gente sabe quem é você).
        </StyledSectionParagraph>
      </StyledSection>

      <StyledSection>
        <StyledSectionHeading>Pagamento</StyledSectionHeading>
        <StyledSectionParagraph>
          Aceitamos crypto e cash anônimo via correio. Pix e cartão também rolam, mas aí o
          processador de pagamento vê o seu nome · não a gente.
        </StyledSectionParagraph>
      </StyledSection>

      <StyledSection>
        <StyledSectionHeading>Jurisdição</StyledSectionHeading>
        <StyledSectionParagraph>
          A VPN.vu opera sob jurisdição offshore (Seicheles), fora do alcance do 5/9/14 Eyes.
          Não respondemos a pedidos de dados de governos · até porque não temos o que
          entregar.
        </StyledSectionParagraph>
      </StyledSection>

      <StyledSection>
        <StyledSectionHeading>Código aberto</StyledSectionHeading>
        <StyledSectionParagraph>
          O cliente VPN.vu é <strong>100% open source</strong> (GPL-3.0) no nosso GitHub.
          Você pode auditar, compilar do source, ou só usar o binário assinado.
        </StyledSectionParagraph>
      </StyledSection>

      <StyledSection>
        <StyledSectionHeading>Última coisa</StyledSectionHeading>
        <StyledSectionParagraph>
          Ao aceitar, você concorda em usar a VPN.vu de forma legal no seu país. Spam,
          fraude e abuso de rede levam ao bloqueio do número · sem aviso.
        </StyledSectionParagraph>
      </StyledSection>
    </>
  );
}

// =============================================================================
// STEP 2 · Terms of use + LGPD framing (NEW)
// =============================================================================

function TermsStepContent() {
  return (
    <>
      <StyledSection>
        <StyledSectionHeading>Direitos sob a LGPD</StyledSectionHeading>
        <StyledSectionParagraph>
          Você pode <strong>consultar, corrigir ou pedir exclusão</strong> dos dados que o
          app guarda no seu dispositivo · basicamente o número da sua conta. Como a gente
          não tem coleta server-side, não tem o que devolver do nosso lado.
        </StyledSectionParagraph>
      </StyledSection>

      <StyledSectionDivider />

      <StyledSection>
        <StyledSectionHeading>Encarregado de proteção de dados</StyledSectionHeading>
        <StyledSectionParagraph>
          Pra dúvidas formais de LGPD, manda email pro nosso DPO em{' '}
          <strong>dpo@vpn.vu</strong>. Respondemos em até 15 dias úteis · normalmente bem
          mais rápido.
        </StyledSectionParagraph>
      </StyledSection>

      <StyledSection>
        <StyledSectionHeading>Compartilhamento</StyledSectionHeading>
        <StyledSectionBigHeadline>
          <span className="positive">Zero.</span>
        </StyledSectionBigHeadline>
        <StyledSectionParagraph>
          A gente <strong>não compartilha dados</strong> com terceiros, governos, parceiros
          comerciais, redes de afiliados, nada. E não é por boa vontade · é que a gente
          literalmente não tem o que compartilhar.
        </StyledSectionParagraph>
      </StyledSection>

      <StyledSectionDivider />

      <StyledSection>
        <StyledSectionHeading>Uso aceitável</StyledSectionHeading>
        <StyledSectionParagraph>
          Usar a VPN.vu pra <strong>spam, fraude, ataque DDoS ou conteúdo ilegal sob a lei
          brasileira</strong> resulta em bloqueio do número sem reembolso. A gente não
          monitora tráfego pra detectar isso · só age em cima de denúncia formal validada.
        </StyledSectionParagraph>
      </StyledSection>

      <StyledSection>
        <StyledSectionHeading>Transparency report</StyledSectionHeading>
        <StyledSectionParagraph>
          Publicamos a cada trimestre quantos pedidos governamentais a gente recebeu em{' '}
          <strong>vpn.vu/transparency</strong>. Se algum dia esse canary sumir do site, é
          pra você assumir que houve comprometimento e parar de usar.
        </StyledSectionParagraph>
      </StyledSection>

      <StyledSectionDivider />

      <StyledSection>
        <StyledSectionHeading>Jurisdição contratual</StyledSectionHeading>
        <StyledSectionParagraph>
          Disputas com users brasileiros tramitam no <strong>foro de São Paulo/Brasil</strong>.
          Pra users internacionais vale a jurisdição offshore (Seicheles). Em qualquer caso,
          a gente não tem dado de tráfego pra entregar.
        </StyledSectionParagraph>
      </StyledSection>
    </>
  );
}

// Step 3 (Diagnóstico opt-in) foi removido a pedido — a gente decide o
// pareamento opt-in/opt-out de telemetria depois, fora do wizard de
// onboarding. Os styled components (StyledCheckboxRow/Box/Label) ficam
// no Styles.tsx pra reuso futuro.
