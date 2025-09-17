import { useRef, useState, type CSSProperties } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// --- TYPES ---
type Exp = { role: string; company: string; period: string; bullets: string[] };
type Edu = { school: string; degree: string; year: string };
type ThemeName = "elegant" | "dark" | "corporate" | "creative" | "light";

// --- COMPONENT ---
export default function App() {
  // --- STATE ---
  const [theme, setTheme] = useState<ThemeName>("elegant");
  const [name, setName] = useState("Your Name");
  const [title, setTitle] = useState("Senior Product Designer");
  const [email, setEmail] = useState("name@example.com");
  const [phone, setPhone] = useState("+00 000 000");
  const [summary, setSummary] = useState("Strategic product designer with a record of shipping delightful experiences that drive business growth and customer satisfaction.");
  const [experiences, setExperiences] = useState<Exp[]>([
    { role: "Senior Designer", company: "Acme Inc", period: "2020 — Present", bullets: ["Led the complete redesign of the flagship product, resulting in a 40% increase in user engagement.", "Improved key product metrics by 32% through user research and data-driven design iterations."] },
    { role: "UX/UI Designer", company: "Innovate LLC", period: "2018 — 2020", bullets: ["Designed and shipped multiple features for a B2B SaaS platform.", "Conducted usability testing sessions to gather feedback and inform design decisions."] },
  ]);
  const [education, setEducation] = useState<Edu[]>([{ school: "University of Design", degree: "B.A. Graphic Design", year: "2017" }]);
  const [skills, setSkills] = useState<string[]>(["Product Design", "Figma", "UX Research", "Prototyping", "Design Systems"]);
  const previewRef = useRef<HTMLDivElement | null>(null);

  // --- DATA HANDLERS ---
  const handleUpdate = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, i: number, field: keyof T, value: string) => {
    setter(prev => prev.map((item, index) => index === i ? { ...item, [field]: value } : item));
  };

  const handleNestedUpdate = (expIndex: number, bulletIndex: number, value: string) => {
    setExperiences(prev => prev.map((exp, i) => i === expIndex ? { ...exp, bullets: exp.bullets.map((b, bi) => bi === bulletIndex ? value : b) } : exp));
  };
  
  const handleAdd = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, newItem: T) => setter(prev => [...prev, newItem]);
  const handleRemove = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, i: number) => setter(prev => prev.filter((_, index) => index !== i));
  
  const addBullet = (i: number) => setExperiences(prev => prev.map((e, idx) => idx === i ? { ...e, bullets: [...e.bullets, "New achievement"] } : e));
  const removeBullet = (expIndex: number, bulletIndex: number) => {
    setExperiences(prev => prev.map((exp, i) => i === expIndex ? { ...exp, bullets: exp.bullets.filter((_, bi) => bi !== bulletIndex) } : exp));
  };

  // --- PDF GENERATION ---
  const downloadStyledPDF = () => {
    if (!previewRef.current) return;
    html2canvas(previewRef.current, { scale: 2, backgroundColor: themeStyles[theme].cardBg }).then(canvas => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgW = pdfW;
      const imgH = (imgProps.height * imgW) / imgProps.width;
      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
      heightLeft -= pdfH;
      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
        heightLeft -= pdfH;
      }
      pdf.save(`${name.replace(/\s+/g, "_")}_Resume.pdf`);
    }).catch(() => alert("Failed to generate PDF"));
  };
  
  const downloadATSPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 40;
    const addText = (text: string, size: number, x: number, isBold = false) => {
        doc.setFontSize(size);
        doc.setFont(doc.getFont().fontName, isBold ? 'bold' : 'normal');
        const splitText = doc.splitTextToSize(text, 515);
        doc.text(splitText, x, y);
        y += (size * 1.15 * splitText.length);
    };

    addText(name, 22, 40, true); y += 4;
    addText(`${title} | ${email} | ${phone}`, 11, 40); y += 20;
    addText("Summary", 14, 40, true); y += 5;
    addText(summary, 11, 40); y += 20;

    addText("Experience", 14, 40, true); y += 5;
    experiences.forEach(exp => {
      addText(`${exp.role} at ${exp.company}`, 12, 40, true);
      addText(exp.period, 10, 40); y += 5;
      exp.bullets.forEach(b => addText(`• ${b}`, 11, 50));
      y += 15;
      if (y > 750) { doc.addPage(); y = 40; }
    });

    addText("Education", 14, 40, true); y += 5;
    education.forEach(ed => { addText(`${ed.degree}, ${ed.school} (${ed.year})`, 11, 40); y += 10; });
    y += 15;
    
    addText("Skills", 14, 40, true); y+=5;
    addText(skills.join(", "), 11, 40);
    doc.save(`${name.replace(/\s+/g, "_")}_ATS_Resume.pdf`);
  };

  // --- STYLES & THEMES ---
  const themeStyles = {
    light: { pageBg: "linear-gradient(180deg, #F9FAFB, #F3F4F6)", cardBg: "#FFFFFF", text: "#111827", accent: "#2563EB", subduedText: "#4B5563" },
    dark: { pageBg: "#111827", cardBg: "#1F2937", text: "#F9FAFB", accent: "#38BDF8", subduedText: "#9CA3AF" },
    elegant: { pageBg: "linear-gradient(180deg, #FDFCFB, #F8F5F1)", cardBg: "#FFFFFF", text: "#1F2937", accent: "#8B5CF6", subduedText: "#4B5563" },
    corporate: { pageBg: "linear-gradient(180deg, #EFF6FF, #EBF5FF)", cardBg: "#FFFFFF", text: "#06202A", accent: "#10B981", subduedText: "#374151" },
    creative: { pageBg: "linear-gradient(90deg, #FFF7F9, #F2F8FF)", cardBg: "rgba(255,255,255,0.95)", text: "#111827", accent: "#EC4899", subduedText: "#4B5563" },
  };

  const ts = themeStyles[theme];

  // --- RENDER ---
  return (
    <div style={{ ...styles.appContainer, background: ts.pageBg, color: ts.text }}>
      <div style={styles.mainGrid}>
        {/* -- EDITOR SIDEBAR -- */}
        <aside style={{...styles.sidebar, backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.6)'}}>
          <h1 style={{ ...styles.h1, background: `linear-gradient(90deg, ${ts.accent}, #38BDF8)`, WebkitBackgroundClip: 'text' }}>Resume Builder</h1>
          <div style={styles.themeSelector}>
            {(Object.keys(themeStyles) as ThemeName[]).map(t => (
              <button key={t} onClick={() => setTheme(t)} style={{...styles.themeButton, color: ts.text, background: theme === t ? ts.cardBg : 'transparent', border: theme === t ? `2px solid ${ts.accent}` : `1px solid ${ts.subduedText}33` }}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div style={styles.formContainer}>
            <Section title="Personal Details">
              <input style={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" />
              <input style={styles.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Job Title" />
              <div style={styles.row}>
                <input style={{...styles.input, flex: 1}} value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
                <input style={{...styles.input, width: '140px'}} value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" />
              </div>
              <textarea style={styles.textarea} value={summary} onChange={e => setSummary(e.target.value)} placeholder="Summary" rows={5} />
            </Section>

            <Section title="Experience" onAdd={() => handleAdd(setExperiences, { role: "New Role", company: "Company", period: "Year — Year", bullets: ["Achievement"] })}>
              {experiences.map((ex, i) => (
                <div key={i} style={styles.itemCard}>
                  <RemovableWrapper onRemove={() => handleRemove(setExperiences, i)}>
                    <input style={styles.input} value={ex.role} onChange={e => handleUpdate(setExperiences, i, 'role', e.target.value)} />
                    <input style={styles.input} value={ex.company} onChange={e => handleUpdate(setExperiences, i, 'company', e.target.value)} />
                    <input style={styles.input} value={ex.period} onChange={e => handleUpdate(setExperiences, i, 'period', e.target.value)} />
                    <div style={{marginTop: '8px'}}>
                      {ex.bullets.map((b, bi) => (
                        <RemovableWrapper key={bi} onRemove={() => removeBullet(i, bi)}>
                            <input style={styles.input} value={b} onChange={e => handleNestedUpdate(i, bi, e.target.value)} />
                        </RemovableWrapper>
                      ))}
                      <button onClick={() => addBullet(i)} style={{...styles.addButton, ...styles.smallButton}}>+ Add Bullet</button>
                    </div>
                  </RemovableWrapper>
                </div>
              ))}
            </Section>
            
            <Section title="Education" onAdd={() => handleAdd(setEducation, { school: "University", degree: "Degree", year: "Year" })}>
              {education.map((ed, i) => (
                <div key={i} style={styles.itemCard}>
                   <RemovableWrapper onRemove={() => handleRemove(setEducation, i)}>
                      <input style={styles.input} value={ed.school} onChange={e => handleUpdate(setEducation, i, 'school', e.target.value)} />
                      <input style={styles.input} value={ed.degree} onChange={e => handleUpdate(setEducation, i, 'degree', e.target.value)} />
                      <input style={styles.input} value={ed.year} onChange={e => handleUpdate(setEducation, i, 'year', e.target.value)} />
                   </RemovableWrapper>
                </div>
              ))}
            </Section>

            <Section title="Skills" onAdd={() => handleAdd<string>(setSkills, 'New Skill')}>
              <div style={styles.skillsContainer}>
                {skills.map((s, i) => (
                    <RemovableWrapper onRemove={() => handleRemove(setSkills, i)} key={i}>
                        <input value={s} onChange={e => setSkills(prev => prev.map((p, pi) => pi === i ? e.target.value : p))} style={styles.skillInput} />
                    </RemovableWrapper>
                ))}
              </div>
            </Section>
          </div>

          <div style={styles.downloadButtons}>
            <button onClick={downloadStyledPDF} style={{...styles.button, background: `linear-gradient(90deg, ${ts.accent}, #38bdf8)`, color: '#fff' }}>Download PDF</button>
            <button onClick={downloadATSPDF} style={{...styles.button, backgroundColor: `${ts.subduedText}33`, color: ts.text}}>Download ATS-Friendly</button>
          </div>
        </aside>

        {/* -- RESUME PREVIEW -- */}
        <main style={{...styles.previewPane, background: ts.cardBg, boxShadow: `0 16px 40px ${ts.text}1a` }}>
          <div ref={previewRef} style={{...styles.previewContent, color: ts.text }}>
            <header style={styles.previewHeader}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800 }}>{name}</div>
                <div style={{ marginTop: 6, fontSize: 14, opacity: 0.9, color: ts.subduedText }}>{title}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13, opacity: 0.9, color: ts.subduedText }}>
                <div>{email}</div>
                <div>{phone}</div>
              </div>
            </header>

            <section style={{ marginTop: 16 }}>
              <h3 style={{...styles.previewH3, color: ts.accent }}>Summary</h3>
              <p style={{ marginTop: 8, lineHeight: 1.65, fontSize: '14px', color: ts.subduedText }}>{summary}</p>
            </section>

            <section style={{ marginTop: 20 }}>
              <h3 style={{...styles.previewH3, color: ts.accent }}>Experience</h3>
              <div style={{ marginTop: 10 }}>
                {experiences.map((ex, i) => (
                  <div key={i} style={{ marginBottom: 16, breakInside: 'avoid' }}>
                    <div style={{ fontWeight: 700 }}>{ex.role}</div>
                    <div style={{ fontSize: 12, opacity: 0.8, color: ts.subduedText, margin: '4px 0' }}>{ex.company} • {ex.period}</div>
                    <ul style={{ marginTop: 8, paddingLeft: '20px' }}>
                      {ex.bullets.map((b, bi) => <li key={bi} style={{ marginBottom: 6, color: ts.subduedText }}>{b}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ marginTop: 8, borderTop: `1px solid ${ts.subduedText}33`, paddingTop: 16, display: 'flex', gap: '24px' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{...styles.previewH3, color: ts.accent }}>Education</h3>
                {education.map((ed, i) => (
                  <div key={i} style={{ marginTop: 10 }}>
                    <div style={{ fontWeight: 700 }}>{ed.school}</div>
                    <div style={{ fontSize: 12, opacity: 0.8, color: ts.subduedText }}>{ed.degree} • {ed.year}</div>
                  </div>
                ))}
              </div>
              <div style={{ width: 220 }}>
                <h3 style={{...styles.previewH3, color: ts.accent }}>Skills</h3>
                <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {skills.map((s, i) => (
                    <div key={i} style={{ padding: '6px 12px', borderRadius: 999, background: `${ts.accent}1a`, color: ts.accent, display: 'inline-block', fontSize: 12, fontWeight: 500 }}>{s}</div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---
const Section = ({ title, onAdd, children }: { title: string, onAdd?: () => void, children: React.ReactNode }) => (
  <div style={styles.section}>
    <div style={styles.sectionHeader}>
      <h2 style={styles.h2}>{title}</h2>
      {/* Use the dynamic addButton style here */}
      {onAdd && <button onClick={onAdd} style={{...styles.addButton, background: ts.accent}}>+ Add</button>}
    </div>
    {children}
  </div>
);

const RemovableWrapper = ({ children, onRemove }: { children: React.ReactNode, onRemove: () => void }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
        <div style={{position: 'relative'}} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {children}
            {isHovered && <button onClick={onRemove} style={styles.removeButton}>×</button>}
        </div>
    );
};

// --- STYLES OBJECT ---
const inputStyles: CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(0,0,0,0.08)',
    background: 'rgba(255,255,255,0.8)',
    boxSizing: 'border-box',
    color: '#111827' // Ensures text is dark and visible
};

const styles: { [key: string]: CSSProperties } = {
  appContainer: { minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', padding: '28px', transition: 'background 0.3s' },
  mainGrid: { maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '480px 1fr', gap: '24px' },
  sidebar: { borderRadius: '16px', padding: '24px', backdropFilter: 'blur(12px)', boxShadow: '0 12px 30px rgba(0,0,0,0.1)', overflowY: 'auto', maxHeight: 'calc(100vh - 56px)' },
  h1: { margin: '0 0 8px 0', fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: 'transparent' },
  h2: { margin: 0, fontSize: '16px', fontWeight: 600 },
  themeSelector: { display: 'flex', gap: '8px', marginBottom: '24px' },
  themeButton: { flex: 1, padding: '8px 10px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px', fontWeight: 500 },
  formContainer: { display: 'grid', gap: '24px' },
  section: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemCard: { padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '8px' },
  row: { display: 'flex', gap: '8px' },
  input: inputStyles,
  textarea: { ...inputStyles, resize: 'vertical', minHeight: '100px' },
  skillsContainer: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  skillInput: { padding: '6px 12px', borderRadius: '999px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', background: '#fff' },
  // UPDATED addButton style
  addButton: {
    padding: '8px 14px',
    borderRadius: '10px',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'background 0.2s ease, transform 0.1s ease',
    // Note: dynamic background is applied directly where the button is rendered due to ts.accent
  },
  // UPDATED smallButton style
  smallButton: {
    fontSize: '12px',
    padding: '6px 10px',
    alignSelf: 'flex-start',
    // Note: dynamic background and color are applied directly where the button is rendered
    // to use ts.accent correctly.
  },
  removeButton: { position: 'absolute', top: -5, right: -5, width: '20px', height: '20px', borderRadius: '50%', border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', zIndex: 10, lineHeight: '1px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' },
  downloadButtons: { display: 'flex', gap: '12px', marginTop: '24px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '24px' },
  button: { flex: 1, padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, transition: 'transform 0.2s' },
  previewPane: { borderRadius: '16px', padding: '20px' },
  previewContent: { maxWidth: '800px', margin: '0 auto', padding: '40px', borderRadius: '12px', transition: 'background 0.3s' },
  previewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: `1px solid rgba(0,0,0,0.08)` },
  previewH3: { margin: 0, fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' },
};
