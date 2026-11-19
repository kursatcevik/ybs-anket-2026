/**
 * Akdeniz Üni. YBS Danışma Kurulu ve STAR Akreditasyon Anketi — İstemci Mantığı
 */

(function () {
  const STORAGE_KEY = "akdeniz_ybs_star_2026_submitted";
  const startTime = Date.now();

  let currentStep = 1;
  let lastPayload = null;

  // Seçili derslerin state'i: Map<courseKey, { semesterId, termType, code, name, category, mandatory, importance, performance, note }>
  const selectedCourses = new Map();

  // DOM elemanları
  const form = document.getElementById("surveyForm");
  const demoBanner = document.getElementById("demoBanner");
  const duplicateBanner = document.getElementById("duplicateBanner");
  const progressCard = document.getElementById("progressCard");
  const stepTitleEl = document.getElementById("stepTitle");
  const stepPercentEl = document.getElementById("stepPercent");
  const progressFillEl = document.getElementById("progressFill");

  const eveningWrap = document.getElementById("eveningWrap");
  const studentDemoWrap = document.getElementById("studentDemoWrap");
  const alumniDemoWrap = document.getElementById("alumniDemoWrap");

  const commonScaleContainer = document.getElementById("commonScaleContainer");
  const studentCoursesModule = document.getElementById("studentCoursesModule");
  const alumniModule = document.getElementById("alumniModule");
  const coursePickerContainer = document.getElementById("coursePickerContainer");
  const ipaCardsContainer = document.getElementById("ipaCardsContainer");
  const ybs402Container = document.getElementById("ybs402Container");
  const skillGapsContainer = document.getElementById("skillGapsContainer");
  const ybs402ImprovementsContainer = document.getElementById("ybs402ImprovementsContainer");
  const step4AiTechContainer = document.getElementById("step4AiTechContainer");
  const step4CurriculumContainer = document.getElementById("step4CurriculumContainer");
  const step4SupportContainer = document.getElementById("step4SupportContainer");

  const STEP_LABELS = {
    1: "Adım 1 / 4: Bilgilendirme ve Katılımcı Profili",
    2: "Adım 2 / 4: Program ve Öğretim Planı Ölçeği",
    3: "Adım 3 / 4: Ders / İşyerinde Eğitim Değerlendirmesi",
    4: "Adım 4 / 4: Yapay Zekâ ve Bölüm Öncelikleri",
  };

  function init() {
    if (!CONFIG.APPS_SCRIPT_URL) {
      demoBanner.classList.remove("hidden");
    }
    try {
      if (localStorage.getItem(STORAGE_KEY)) {
        duplicateBanner.classList.remove("hidden");
      }
    } catch (_) {}

    bindStatusEvents();
    bindNavigation();
    renderAlumniModule();
    renderStep4Options();
    updateProgress(1);
  }

  function getSelectedStatus() {
    const checked = document.querySelector('input[name="participantStatus"]:checked');
    return checked ? checked.value : "";
  }

  function getSelectedProgramType() {
    const status = getSelectedStatus();
    if (status === "4") {
      const checked = document.querySelector('input[name="programType"]:checked');
      return checked ? checked.value : "";
    }
    return status === "Mezun" ? "Mezun" : "I. Ogretim";
  }

  function bindStatusEvents() {
    document.querySelectorAll('input[name="participantStatus"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        const val = radio.value;
        const isAlumni = val === "Mezun";
        eveningWrap.classList.toggle("hidden", val !== "4");
        studentDemoWrap.classList.toggle("hidden", isAlumni);
        alumniDemoWrap.classList.toggle("hidden", !isAlumni);

        // Statü değişince ders seçim state'ini sıfırla
        selectedCourses.clear();
      });
    });

    document.querySelectorAll('input[name="programType"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        selectedCourses.clear();
      });
    });
  }

  function bindNavigation() {
    document.getElementById("btnNext1").addEventListener("click", () => {
      if (!validateStep1()) return;
      renderCommonScale(getSelectedStatus() === "Mezun");
      goToStep(2);
    });

    document.getElementById("btnPrev2").addEventListener("click", () => goToStep(1));
    document.getElementById("btnNext2").addEventListener("click", () => {
      if (!validateStep2()) return;
      prepareStep3();
      goToStep(3);
    });

    document.getElementById("btnPrev3").addEventListener("click", () => goToStep(2));
    document.getElementById("btnNext3").addEventListener("click", () => {
      if (!validateStep3()) return;
      goToStep(4);
    });

    document.getElementById("btnPrev4").addEventListener("click", () => goToStep(3));

    form.addEventListener("submit", handleSubmit);

    document.getElementById("btnDownloadJson").addEventListener("click", () => {
      if (!lastPayload) return;
      const blob = new Blob([JSON.stringify(lastPayload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ybs_anket_${lastPayload.responseId}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function goToStep(stepNum) {
    currentStep = stepNum;
    document.querySelectorAll(".step-section").forEach((sec) => sec.classList.add("hidden"));
    document.getElementById(`step${stepNum}`).classList.remove("hidden");
    updateProgress(stepNum);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateProgress(stepNum) {
    const pct = stepNum * 25;
    stepTitleEl.textContent = STEP_LABELS[stepNum] || "";
    stepPercentEl.textContent = `${pct}%`;
    progressFillEl.style.width = `${pct}%`;
  }

  function showError(id, msg) {
    const el = document.getElementById(id);
    if (!el) return;
    if (!msg) {
      el.classList.remove("visible");
      el.textContent = "";
      return;
    }
    el.textContent = msg;
    el.classList.add("visible");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------------- ADIM 1 DOĞRULAMA ---------------- */
  function validateStep1() {
    showError("errorStep1", "");
    if (!document.getElementById("consentCheck").checked) {
      showError("errorStep1", "Devam edebilmek için bilgilendirme ve gönüllü katılım onayını işaretlemeniz gerekmektedir.");
      return false;
    }
    const status = getSelectedStatus();
    if (!status) {
      showError("errorStep1", "Lütfen mevcut öğrenim statünüzü (1–4. sınıf veya Mezun) seçiniz.");
      return false;
    }
    if (status === "4" && !getSelectedProgramType()) {
      showError("errorStep1", "Lütfen 4. sınıf öğretim türünüzü (I. Öğretim veya II. Öğretim) seçiniz.");
      return false;
    }
    if (status !== "Mezun") {
      if (!document.getElementById("entryYear").value) {
        showError("errorStep1", "Lütfen bölüme giriş yılınızı seçiniz.");
        return false;
      }
      if (!document.getElementById("transferStatus").value) {
        showError("errorStep1", "Lütfen bölüme giriş şeklinizi seçiniz.");
        return false;
      }
    } else {
      if (!document.getElementById("gradYear").value) {
        showError("errorStep1", "Lütfen mezuniyet yılınızı seçiniz.");
        return false;
      }
      if (!document.getElementById("workStatus").value) {
        showError("errorStep1", "Lütfen mevcut çalışma durumunuzu seçiniz.");
        return false;
      }
    }
    return true;
  }

  /* ---------------- ADIM 2: ORTAK ÖLÇEK ---------------- */
  function renderCommonScale(isAlumni) {
    // Mevcut seçimleri koru
    const prevAnswers = {};
    COMMON_SCALE_DIMENSIONS.forEach((dim) => {
      dim.items.forEach((item) => {
        const checked = document.querySelector(`input[name="scale_${item.code}"]:checked`);
        if (checked) prevAnswers[item.code] = checked.value;
      });
    });

    commonScaleContainer.innerHTML = "";

    COMMON_SCALE_DIMENSIONS.forEach((dim) => {
      const block = document.createElement("div");
      block.className = "dimension-block";

      const header = document.createElement("div");
      header.className = "dimension-header";
      header.innerHTML = `<h3>${dim.title}</h3><p>${dim.description}</p>`;
      block.appendChild(header);

      const itemsWrap = document.createElement("div");
      itemsWrap.className = "dimension-items";

      dim.items.forEach((item) => {
        const row = document.createElement("div");
        row.className = "likert-item";
        row.id = `item_wrap_${item.code}`;

        const text = isAlumni ? item.alumniText : item.studentText;
        const buttonsHtml = LIKERT_SCALE.map((opt) => {
          const checkedAttr = prevAnswers[item.code] === String(opt.value) ? "checked" : "";
          const inputId = `scale_${item.code}_${opt.value}`;
          return `
            <div class="likert-btn">
              <input type="radio" id="${inputId}" name="scale_${item.code}" value="${opt.value}" ${checkedAttr} />
              <label for="${inputId}">
                <span class="num">${opt.short}</span>
                <span class="lbl">${opt.label}</span>
              </label>
            </div>
          `;
        }).join("");

        row.innerHTML = `
          <div class="likert-question">
            <span class="likert-code">${item.code}</span>${text}
          </div>
          <div class="likert-scale">${buttonsHtml}</div>
        `;
        itemsWrap.appendChild(row);
      });

      block.appendChild(itemsWrap);
      commonScaleContainer.appendChild(block);
    });
  }

  function validateStep2() {
    showError("errorStep2", "");
    let firstMissing = null;

    COMMON_SCALE_DIMENSIONS.forEach((dim) => {
      dim.items.forEach((item) => {
        const wrap = document.getElementById(`item_wrap_${item.code}`);
        const checked = document.querySelector(`input[name="scale_${item.code}"]:checked`);
        if (!checked) {
          wrap.classList.add("missing-error");
          if (!firstMissing) firstMissing = wrap;
        } else {
          wrap.classList.remove("missing-error");
        }
      });
    });

    if (firstMissing) {
      showError("errorStep2", "Lütfen işaretlenmemiş tüm ölçek maddelerini yanıtlayınız (kırmızı ile vurgulanan maddeler).");
      firstMissing.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  /* ---------------- ADIM 3: KOŞULLU DERS IPA / MEZUN MODÜLÜ ---------------- */
  function prepareStep3() {
    const status = getSelectedStatus();
    if (status === "Mezun") {
      studentCoursesModule.classList.add("hidden");
      alumniModule.classList.remove("hidden");
      return;
    }
    alumniModule.classList.add("hidden");
    studentCoursesModule.classList.remove("hidden");
    renderStudentCourseSelection(status);
  }

  function getCourseKey(semId, code) {
    return `${semId}__${code}`;
  }

  function renderStudentCourseSelection(status) {
    const semesters = CURRICULUM_BY_CLASS[status] || [];
    const progType = getSelectedProgramType();

    // İlk açılışta zorunlu dersleri otomatik seçili getir
    const shouldPreselect = selectedCourses.size === 0;

    coursePickerContainer.innerHTML = "";

    semesters.forEach((sem) => {
      const sec = document.createElement("div");
      sec.className = "semester-section";

      const isPast = sem.termType.startsWith("Tamamlanan");
      sec.innerHTML = `
        <div class="semester-heading">
          <h3>${sem.semesterTitle}</h3>
          <span class="term-badge ${isPast ? "past" : ""}">${sem.termBadge}</span>
        </div>
      `;

      const grid = document.createElement("div");
      grid.className = "course-picker-grid";

      sem.courses.forEach((course) => {
        if (course.onlyEvening && progType !== "II. Ogretim") {
          return;
        }
        const key = getCourseKey(sem.semesterId, course.code);
        if (shouldPreselect && course.mandatory) {
          selectedCourses.set(key, {
            semesterId: sem.semesterId,
            termType: sem.termType,
            code: course.code,
            name: course.name,
            category: course.category,
            mandatory: course.mandatory,
            importance: null,
            performance: null,
            tags: [],
          });
        }

        const isChecked = selectedCourses.has(key);
        const chip = document.createElement("label");
        chip.className = `course-chip ${isChecked ? "selected" : ""}`;

        const catTag =
          course.category === "YBS"
            ? `<span class="tag tag-ybs">YBS</span>`
            : `<span class="tag tag-ortak">Ortak</span>`;
        const electTag = !course.mandatory ? `<span class="tag tag-secmeli">Seçmeli</span>` : "";

        chip.innerHTML = `
          <input type="checkbox" data-course-key="${key}" ${isChecked ? "checked" : ""} />
          <div>
            <div><strong>${course.name}</strong></div>
            <div class="course-meta">
              ${catTag}
              ${electTag}
            </div>
          </div>
        `;

        const checkbox = chip.querySelector("input");
        checkbox.addEventListener("change", () => {
          if (checkbox.checked) {
            selectedCourses.set(key, {
              semesterId: sem.semesterId,
              termType: sem.termType,
              code: course.code,
              name: course.name,
              category: course.category,
              mandatory: course.mandatory,
              importance: null,
              performance: null,
              tags: [],
            });
            chip.classList.add("selected");
          } else {
            selectedCourses.delete(key);
            chip.classList.remove("selected");
          }
          renderIpaCards();
        });

        grid.appendChild(chip);
      });

      sec.appendChild(grid);
      coursePickerContainer.appendChild(sec);
    });

    renderIpaCards();
  }

  function renderIpaCards() {
    ipaCardsContainer.innerHTML = "";

    if (selectedCourses.size === 0) {
      ipaCardsContainer.innerHTML = `
        <div class="info-box">
          Değerlendirme kartlarını görmek için yukarıdan aldığınız en az bir dersi işaretleyiniz.
        </div>
      `;
      return;
    }

    const heading = document.createElement("h3");
    heading.style.margin = "18px 0 10px";
    heading.style.color = "var(--primary)";
    heading.style.fontSize = "1.02rem";
    heading.textContent = `Seçtiğiniz Derslerin Değerlendirmesi (${selectedCourses.size} ders)`;
    ipaCardsContainer.appendChild(heading);

    selectedCourses.forEach((course, key) => {
      const card = document.createElement("div");
      card.className = "ipa-card";
      card.id = `ipa_card_${key}`;

      const impButtons = [1, 2, 3, 4, 5]
        .map((v) => {
          const checked = course.importance === v ? "checked" : "";
          const id = `imp_${key}_${v}`;
          return `
            <div class="ipa-btn">
              <input type="radio" id="${id}" name="imp_${key}" value="${v}" ${checked} />
              <label for="${id}" title="${IPA_IMPORTANCE_LABELS[v]}">${v}</label>
            </div>
          `;
        })
        .join("");

      const perfButtons = [1, 2, 3, 4, 5]
        .map((v) => {
          const checked = course.performance === v ? "checked" : "";
          const id = `perf_${key}_${v}`;
          return `
            <div class="ipa-btn perf">
              <input type="radio" id="${id}" name="perf_${key}" value="${v}" ${checked} />
              <label for="${id}" title="${IPA_PERFORMANCE_LABELS[v]}">${v}</label>
            </div>
          `;
        })
        .join("");

      const tagsHtml = COURSE_IMPROVEMENT_TAGS.map((tagText, idx) => {
        const isActive = (course.tags || []).includes(tagText);
        const tagId = `tag_${key}_${idx}`;
        return `
          <label class="ipa-tag-chip ${isActive ? "active" : ""}" for="${tagId}">
            <input type="checkbox" id="${tagId}" data-tag-key="${key}" value="${escapeHtml(tagText)}" ${isActive ? "checked" : ""} />
            <span>${tagText}</span>
          </label>
        `;
      }).join("");

      card.innerHTML = `
        <div class="ipa-card-title">
          <strong>${course.name}</strong>
          <div>
            <span class="tag ${course.category === "YBS" ? "tag-ybs" : "tag-ortak"}">${course.category}</span>
            <span class="tag tag-ortak">${course.semesterId}</span>
          </div>
        </div>
        <div class="ipa-axes">
          <div class="ipa-box ipa-box-imp">
            <span class="ipa-axis-badge">1. Soru • Genel Kariyer Önemi</span>
            <div class="ipa-axis-label">
              Bu ders konusu YBS alanı ve kariyerin için genel olarak ne kadar önemli?
              <span>1: Hiç Önemli Değil &nbsp;—&nbsp; 5: Çok Önemli</span>
            </div>
            <div class="ipa-row">${impButtons}</div>
          </div>
          <div class="ipa-box ipa-box-perf">
            <span class="ipa-axis-badge">2. Soru • Kendi Aldığın Dersin Yeterliliği</span>
            <div class="ipa-axis-label">
              Bölümde kendi aldığın bu dersin içeriği, işlenişi ve uygulaması ne kadar yeterli?
              <span>1: Çok Yetersiz &nbsp;—&nbsp; 5: Çok Yeterli</span>
            </div>
            <div class="ipa-row">${perfButtons}</div>
          </div>
        </div>
        <div class="ipa-tags-wrap">
          <div class="ipa-tags-title">İsteğe bağlı iyileştirme etiketi seçebilirsiniz:</div>
          <div class="ipa-tags-row">${tagsHtml}</div>
        </div>
      `;

      card.querySelectorAll(`input[name="imp_${key}"]`).forEach((r) => {
        r.addEventListener("change", () => {
          course.importance = Number(r.value);
          card.classList.remove("missing-error");
        });
      });

      card.querySelectorAll(`input[name="perf_${key}"]`).forEach((r) => {
        r.addEventListener("change", () => {
          course.performance = Number(r.value);
          card.classList.remove("missing-error");
        });
      });

      card.querySelectorAll(`input[data-tag-key="${key}"]`).forEach((cb) => {
        cb.addEventListener("change", () => {
          if (!Array.isArray(course.tags)) course.tags = [];
          if (cb.checked) {
            if (!course.tags.includes(cb.value)) course.tags.push(cb.value);
            cb.closest(".ipa-tag-chip").classList.add("active");
          } else {
            course.tags = course.tags.filter((t) => t !== cb.value);
            cb.closest(".ipa-tag-chip").classList.remove("active");
          }
        });
      });

      ipaCardsContainer.appendChild(card);
    });
  }

  function renderAlumniModule() {
    ybs402Container.innerHTML = `
      <div class="dimension-header">
        <h3>YBS 402 — İş Yerinde Eğitim (8. Yarıyıl) Süreç Değerlendirmesi</h3>
        <p>1 (Kesinlikle Katılmıyorum) — 5 (Kesinlikle Katılıyorum)</p>
      </div>
    `;

    const itemsWrap = document.createElement("div");
    itemsWrap.className = "dimension-items";

    ALUMNI_YBS402_ITEMS.forEach((item) => {
      const row = document.createElement("div");
      row.className = "likert-item";
      row.id = `item_wrap_${item.code}`;

      const buttonsHtml = LIKERT_SCALE.map((opt) => {
        const inputId = `ybs402_${item.code}_${opt.value}`;
        return `
          <div class="likert-btn">
            <input type="radio" id="${inputId}" name="ybs402_${item.code}" value="${opt.value}" />
            <label for="${inputId}">
              <span class="num">${opt.short}</span>
              <span class="lbl">${opt.label}</span>
            </label>
          </div>
        `;
      }).join("");

      row.innerHTML = `
        <div class="likert-question">
          <span class="likert-code">${item.code}</span>${item.text}
        </div>
        <div class="likert-scale">${buttonsHtml}</div>
      `;
      itemsWrap.appendChild(row);
    });
    ybs402Container.appendChild(itemsWrap);

    renderCheckboxGroup(skillGapsContainer, "skillGaps", ALUMNI_SKILL_GAPS, 4, "errorStep3Alumni");
    renderCheckboxGroup(
      ybs402ImprovementsContainer,
      "ybs402Improvements",
      ALUMNI_YBS402_IMPROVEMENTS,
      3,
      "errorStep3Alumni"
    );
  }

  function renderStep4Options() {
    renderCheckboxGroup(
      step4AiTechContainer,
      "step4AiTech",
      STEP4_QUESTIONS.aiTech.options,
      STEP4_QUESTIONS.aiTech.maxSelect,
      "errorStep4"
    );
    renderCheckboxGroup(
      step4CurriculumContainer,
      "step4Curriculum",
      STEP4_QUESTIONS.curriculum.options,
      STEP4_QUESTIONS.curriculum.maxSelect,
      "errorStep4"
    );
    renderCheckboxGroup(
      step4SupportContainer,
      "step4Support",
      STEP4_QUESTIONS.support.options,
      STEP4_QUESTIONS.support.maxSelect,
      "errorStep4"
    );
  }

  function renderCheckboxGroup(container, name, options, maxSelect, errorBoxId) {
    if (!container) return;
    container.innerHTML = "";
    options.forEach((optText, idx) => {
      const label = document.createElement("label");
      label.className = "checkbox-item";
      label.innerHTML = `
        <input type="checkbox" name="${name}" value="${escapeHtml(optText)}" id="${name}_${idx}" />
        <span>${optText}</span>
      `;
      const cb = label.querySelector("input");
      cb.addEventListener("change", () => {
        const checkedCount = document.querySelectorAll(`input[name="${name}"]:checked`).length;
        if (checkedCount > maxSelect) {
          cb.checked = false;
          showError(errorBoxId, `Bu soruda en fazla ${maxSelect} seçenek işaretleyebilirsiniz.`);
        } else {
          showError(errorBoxId, "");
        }
      });
      container.appendChild(label);
    });
  }

  function getCheckedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((el) => el.value);
  }

  function validateStep3() {
    const status = getSelectedStatus();
    if (status === "Mezun") {
      showError("errorStep3Alumni", "");
      let firstMissing = null;
      ALUMNI_YBS402_ITEMS.forEach((item) => {
        const wrap = document.getElementById(`item_wrap_${item.code}`);
        const checked = document.querySelector(`input[name="ybs402_${item.code}"]:checked`);
        if (!checked) {
          wrap.classList.add("missing-error");
          if (!firstMissing) firstMissing = wrap;
        } else {
          wrap.classList.remove("missing-error");
        }
      });
      if (firstMissing) {
        showError("errorStep3Alumni", "Lütfen İşyerinde Eğitim (YBS 402) maddelerinin tamamını yanıtlayınız.");
        firstMissing.scrollIntoView({ behavior: "smooth", block: "center" });
        return false;
      }
      if (getCheckedValues("skillGaps").length === 0) {
        showError("errorStep3Alumni", "Lütfen iş yaşamında eksikliğini hissettiğiniz en az 1 yetkinlik alanı seçiniz.");
        return false;
      }
      if (getCheckedValues("ybs402Improvements").length === 0) {
        showError("errorStep3Alumni", "Lütfen İşyerinde Eğitim (YBS 402) için en az 1 iyileştirme seçeneği işaretleyiniz.");
        return false;
      }
      return true;
    }

    showError("errorStep3Student", "");
    if (selectedCourses.size === 0) {
      showError("errorStep3Student", "Lütfen değerlendirmek üzere aldığınız en az bir dersi işaretleyiniz.");
      return false;
    }

    let firstMissingCard = null;
    selectedCourses.forEach((course, key) => {
      const card = document.getElementById(`ipa_card_${key}`);
      if (!course.importance || !course.performance) {
        card.classList.add("missing-error");
        if (!firstMissingCard) firstMissingCard = card;
      } else {
        card.classList.remove("missing-error");
      }
    });

    if (firstMissingCard) {
      showError(
        "errorStep3Student",
        "Lütfen seçtiğiniz tüm dersler için hem mavi kutudaki 'Genel Kariyer Önemi' hem de mor kutudaki 'Kendi Aldığın Dersin Yeterliliği' puanlarını işaretleyiniz."
      );
      firstMissingCard.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  function validateStep4() {
    showError("errorStep4", "");
    if (getCheckedValues("step4AiTech").length === 0) {
      showError("errorStep4", "Lütfen 1. soruda (güncel teknoloji alanları) en az 1 seçenek işaretleyiniz.");
      return false;
    }
    if (getCheckedValues("step4Curriculum").length === 0) {
      showError("errorStep4", "Lütfen 2. soruda (öğretim planı ve değerlendirme) en az 1 seçenek işaretleyiniz.");
      return false;
    }
    if (getCheckedValues("step4Support").length === 0) {
      showError("errorStep4", "Lütfen 3. soruda (danışmanlık ve bölüm süreçleri) en az 1 seçenek işaretleyiniz.");
      return false;
    }
    return true;
  }

  /* ---------------- PAYLOAD OLUŞTURMA VE GÖNDERİM ---------------- */
  function buildPayload() {
    const status = getSelectedStatus();
    const isAlumni = status === "Mezun";
    const durationSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const responseId = `YBS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const commonScale = {};
    COMMON_SCALE_DIMENSIONS.forEach((dim) => {
      dim.items.forEach((item) => {
        const checked = document.querySelector(`input[name="scale_${item.code}"]:checked`);
        commonScale[item.code] = checked ? Number(checked.value) : null;
      });
    });

    const courses = [];
    if (!isAlumni) {
      selectedCourses.forEach((c) => {
        courses.push({
          semesterId: c.semesterId,
          termType: c.termType,
          code: c.code,
          name: c.name,
          category: c.category,
          mandatory: c.mandatory,
          importance: c.importance,
          performance: c.performance,
          note: Array.isArray(c.tags) ? c.tags.join(" | ") : "",
        });
      });
    }

    let alumniData = null;
    if (isAlumni) {
      const ybs402 = {};
      ALUMNI_YBS402_ITEMS.forEach((item) => {
        const checked = document.querySelector(`input[name="ybs402_${item.code}"]:checked`);
        ybs402[item.code] = checked ? Number(checked.value) : null;
      });
      alumniData = {
        gradYear: document.getElementById("gradYear").value,
        workStatus: document.getElementById("workStatus").value,
        ybs402,
        skillGaps: getCheckedValues("skillGaps"),
        ybs402Note: getCheckedValues("ybs402Improvements").join(" | "),
      };
    }

    return {
      surveyVersion: CONFIG.SURVEY_VERSION,
      responseId,
      submittedAt: new Date().toISOString(),
      durationSec,
      honeypot: document.getElementById("websiteHp").value,
      demographics: {
        status,
        programType: getSelectedProgramType(),
        entryYear: isAlumni ? "" : document.getElementById("entryYear").value,
        transferStatus: isAlumni ? "" : document.getElementById("transferStatus").value,
        gpaRange: isAlumni ? "" : document.getElementById("gpaRange").value,
        retakeStatus: isAlumni ? "" : document.getElementById("retakeStatus").value,
      },
      commonScale,
      courses,
      extraCoursesNote: "",
      alumniData,
      openEnded: {
        aiAndTech: getCheckedValues("step4AiTech").join(" | "),
        curriculum: getCheckedValues("step4Curriculum").join(" | "),
        general: getCheckedValues("step4Support").join(" | "),
      },
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateStep4()) return;

    const btn = document.getElementById("btnSubmit");
    const payload = buildPayload();
    lastPayload = payload;

    // Demo modu (Apps Script URL tanımlı değilse)
    if (!CONFIG.APPS_SCRIPT_URL) {
      finishSurvey(true, payload);
      return;
    }

    btn.disabled = true;
    btn.textContent = "Gönderiliyor...";

    try {
      // text/plain CORS preflight (OPTIONS) hatasını önler; Google Apps Script doPost ile tam uyumludur.
      const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      let ok = res.ok;
      try {
        const json = await res.json();
        if (json && json.status === "error") {
          throw new Error(json.message || "Sunucu doğrulama hatası.");
        }
        ok = true;
      } catch (parseErr) {
        // Opaque veya text yanıtı gelirse HTTP 200 durumunda başarılı kabul et
        if (!res.ok) throw parseErr;
      }

      if (!ok) {
        throw new Error("Yanıt kaydedilemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyiniz.");
      }

      try {
        localStorage.setItem(STORAGE_KEY, payload.responseId);
      } catch (_) {}

      finishSurvey(false, payload);
    } catch (err) {
      showError("errorStep4", `Gönderim sırasında bir hata oluştu: ${err.message}`);
      btn.disabled = false;
      btn.textContent = "Anketi Gönder";
    }
  }

  function finishSurvey(isDemo, payload) {
    document.querySelectorAll(".step-section").forEach((sec) => sec.classList.add("hidden"));
    progressCard.classList.add("hidden");
    document.getElementById("stepDone").classList.remove("hidden");

    if (isDemo) {
      document.getElementById("doneTitle").textContent = "Test Gönderimi Tamamlandı (Demo Modu)";
      document.getElementById("doneMessage").textContent =
        "APPS_SCRIPT_URL tanımlanmadığı için veri sunucuya gönderilmedi. Kurulum tamamlandığında veriler otomatik olarak Google Sheets'e yazılacaktır.";
      document.getElementById("demoExportWrap").classList.remove("hidden");
      document.getElementById("demoJsonPreview").textContent = JSON.stringify(payload, null, 2);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  init();
})();
