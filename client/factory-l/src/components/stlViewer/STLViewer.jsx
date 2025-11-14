import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import Model from './Model';

const palette = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  surface: 'var(--color-white)',
  surfaceMuted: '#f7f8fa',
  border: 'var(--color-black-tr-80)',
  text: 'var(--color-black)',
  textMuted: 'var(--color-black-tr-20)',
  canvas: '#1b261d',
};

const MATERIAL_PRESETS = [
  {
    id: 'pla',
    label: 'PLA',
    spoolPrice: 55,
    spoolWeight: 1000,
    density: 1.24,
    markup: 0.35,
    colors: [
      { id: 'pla-black', label: 'შავი (მატი)', hex: '#1f1f1f' },
      { id: 'pla-white', label: 'თეთრი', hex: '#f4f4f4' },
      { id: 'pla-gray', label: 'ნაცრისფერი', hex: '#9ca3af' },
      { id: 'pla-blue', label: 'ლურჯი', hex: '#2563eb' },
      { id: 'pla-red', label: 'წითელი', hex: '#dc2626' },
      { id: 'pla-green', label: 'მწვანე', hex: '#059669' },
    ],
  },
  {
    id: 'petg',
    label: 'PETG',
    spoolPrice: 62,
    spoolWeight: 1000,
    density: 1.27,
    markup: 0.35,
    colors: [
      { id: 'petg-black', label: 'შავი (მატი)', hex: '#1f1f1f' },
      { id: 'petg-white', label: 'თეთრი', hex: '#f4f4f4' },
      { id: 'petg-gray', label: 'ნაცრისფერი', hex: '#9ca3af' },
      { id: 'petg-blue', label: 'ლურჯი', hex: '#3b82f6' },
      { id: 'petg-orange', label: ' ნარინჯისფერი', hex: '#f97316' },
      { id: 'petg-clear', label: 'გამჭვირვალე', hex: '#d1d5db' },
    ],
  },
  {
    id: 'abs',
    label: 'ABS',
    spoolPrice: 70,
    spoolWeight: 1000,
    density: 1.04,
    markup: 0.4,
    colors: [
      { id: 'abs-black', label: 'შავი', hex: '#111827' },
      { id: 'abs-white', label: 'თეთრი', hex: '#f9fafb' },
      { id: 'abs-gray', label: 'ნაცრისფერი', hex: '#6b7280' },
      { id: 'abs-yellow', label: 'ყვითელი', hex: '#facc15' },
    ],
  },
  {
    id: 'resin',
    label: 'რეზინი',
    spoolPrice: 80,
    spoolWeight: 1000,
    density: 1.11,
    markup: 0.45,
    colors: [
      { id: 'resin-gray', label: 'ნაცრისფერი', hex: '#9ca3af' },
      { id: 'resin-clear', label: 'გამჭვირვალე', hex: '#cbd5f5' },
      { id: 'resin-black', label: 'შავი', hex: '#111827' },
      { id: 'resin-white', label: 'თეთრი', hex: '#f4f4f4' },
    ],
  },
];

const DEFAULT_COLOR_ID = MATERIAL_PRESETS[0].colors?.[0]?.id ?? '';

const QUOTE_ENDPOINT = process.env.REACT_APP_QUOTE_ENDPOINT || '';

const PRICING_RULES = {
  baseFee: 8, // ₾
  utilizationFactor: 0.18,
  printSpeedCm3PerHour: 18,
  longPrintSurcharge: {
    hourThreshold: 12,
    amount: 6,
  },
};

const formatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const cmFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const containerStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(280px, 340px) 1fr',
  gap: '32px',
  padding: '32px 40px',
  height: '100%',
  boxSizing: 'border-box',
  background: palette.surfaceMuted,
  color: palette.text,
};

const sidebarStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  position: 'sticky',
  top: '24px',
  alignSelf: 'start',
};

const infoCardStyle = {
  border: `1px solid ${palette.border}`,
  borderRadius: 'var(--radius-m)',
  padding: '20px',
  background: palette.surface,
  boxShadow: '0 20px 45px -30px rgba(18, 43, 31, 0.45)',
};

const canvasWrapperStyle = {
  height: '72vh',
  minHeight: '520px',
  borderRadius: 'var(--radius-l)',
  border: `1px solid ${palette.border}`,
  overflow: 'hidden',
  position: 'relative',
  background: palette.canvas,
  boxShadow: '0 24px 60px -35px rgba(18, 43, 31, 0.7)',
};

const filePickerContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const fileButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 18px',
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: palette.secondary,
  color: palette.primary,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
  boxShadow: '0 12px 24px -15px rgba(231, 196, 106, 0.85)',
};

const fileHintStyle = {
  fontSize: '13px',
  color: palette.textMuted,
  lineHeight: 1.5,
};

const quickScaleButtonStyle = {
  padding: '6px 12px',
  borderRadius: 'var(--radius-sm)',
  border: `1px solid ${palette.border}`,
  background: palette.surfaceMuted,
  cursor: 'pointer',
  fontSize: '13px',
  color: palette.text,
  transition: 'all 0.15s ease-in-out',
};

const inputControlStyle = {
  padding: '10px 14px',
  borderRadius: 'var(--radius-sm)',
  border: `1px solid ${palette.border}`,
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box',
};

const textAreaStyle = {
  ...inputControlStyle,
  minHeight: '96px',
  resize: 'vertical',
};

const submitButtonStyle = {
  marginTop: '12px',
  padding: '12px 18px',
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: palette.primary,
  color: palette.surface,
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
};

const statusMessageStyle = {
  marginTop: '10px',
  fontSize: '13px',
  lineHeight: 1.55,
};

const getGeometrySize = (geometry) => {
  if (!geometry) {
    return null;
  }

  geometry.computeBoundingBox();
  if (!geometry.boundingBox) {
    return null;
  }

  const size = new THREE.Vector3();
  geometry.boundingBox.getSize(size);
  return size;
};

const suggestScaleMultiplier = (size) => {
  if (!size) {
    return 1;
  }

  const maxAxis = Math.max(size.x, size.y, size.z);
  if (!Number.isFinite(maxAxis) || maxAxis <= 0) {
    return 1;
  }

  if (maxAxis < 0.5) {
    return 1000;
  }
  if (maxAxis < 5) {
    return 100;
  }
  if (maxAxis < 50) {
    return 10;
  }

  return 1;
};

const radioGroupStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
};

const radioOptionStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  border: `2px solid ${palette.border}`,
  background: palette.surface,
  cursor: 'pointer',
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out, border 0.15s ease-in-out',
};

const radioSelectedStyle = {
  border: `2px solid ${palette.secondary}`,
  boxShadow: '0 0 0 4px rgba(231, 196, 106, 0.25)',
  transform: 'scale(1.05)',
};

const swatchDotStyle = (color) => ({
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  background: color,
});

const srOnlyStyle = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

function STLViewer() {
  const fileInputRef = useRef(null);
  const [geometry, setGeometry] = useState(null);
  const [fileMeta, setFileMeta] = useState(null);
  const [volumeMm3, setVolumeMm3] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const [materialId, setMaterialId] = useState(MATERIAL_PRESETS[0].id);
  const [colorId, setColorId] = useState(DEFAULT_COLOR_ID);
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  const [autoScaleNote, setAutoScaleNote] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitState, setSubmitState] = useState({ status: 'idle' });

  const selectedMaterial = MATERIAL_PRESETS.find((item) => item.id === materialId) ?? MATERIAL_PRESETS[0];
  const colorOptions = useMemo(() => selectedMaterial?.colors ?? [], [selectedMaterial]);
  const selectedColor = colorOptions.find((item) => item.id === colorId) ?? colorOptions[0] ?? null;
  const modelColorHex = selectedColor?.hex ?? '#2c7be5';

  const pricingDetails = useMemo(() => {
    if (!volumeMm3 || !selectedMaterial) {
      return null;
    }

    const rawVolumeCm3 = volumeMm3 / 1000;
    const effectiveVolumeCm3 = rawVolumeCm3 * PRICING_RULES.utilizationFactor;
    const grams = effectiveVolumeCm3 * selectedMaterial.density;
    const costPerGram = selectedMaterial.spoolPrice / selectedMaterial.spoolWeight;
    const materialCost = grams * costPerGram;
    const marginCost = materialCost * selectedMaterial.markup;
    const estimatedHours = effectiveVolumeCm3 / PRICING_RULES.printSpeedCm3PerHour;
    const surcharge = estimatedHours > PRICING_RULES.longPrintSurcharge.hourThreshold
      ? PRICING_RULES.longPrintSurcharge.amount
      : 0;

    const total = PRICING_RULES.baseFee + materialCost + marginCost + surcharge;

    return {
      total,
      baseFee: PRICING_RULES.baseFee,
      materialCost,
      marginCost,
      surcharge,
      rawVolumeCm3,
      effectiveVolumeCm3,
      grams,
      estimatedHours,
      costPerGram,
    };
  }, [selectedMaterial, volumeMm3]);

  useEffect(() => {
    return () => {
      setGeometry(null);
    };
  }, []);

  useEffect(() => {
    if (!colorOptions.length) {
      if (colorId) {
        setColorId('');
      }
      return;
    }

    const matchesCurrent = colorOptions.some((option) => option.id === colorId);
    if (!matchesCurrent) {
      setColorId(colorOptions[0].id);
    }
  }, [colorOptions, colorId]);

  const parseStlFile = async (file) => {
    const loader = new STLLoader();

    const arrayBuffer = await file.arrayBuffer();
    return loader.parse(arrayBuffer);
  };

  const handleFileChange = async (event) => {
    const nextFile = event.target.files?.[0];

    if (!nextFile) {
      return;
    }

    if (!nextFile.name.toLowerCase().endsWith('.stl')) {
      setError('ამ ეტაპზე მხოლოდ STL ფაილებია მხარდაჭერილი.');
      return;
    }

    setError('');
    setVolumeMm3(null);
    setDimensions(null);

    try {
      const parsedGeometry = await parseStlFile(nextFile);
      const rawSize = getGeometrySize(parsedGeometry);
      const suggestedScale = suggestScaleMultiplier(rawSize);

      setGeometry(parsedGeometry);
      setFileMeta({ name: nextFile.name, sizeInBytes: nextFile.size });
      // setAutoScaleNote(
      //   suggestedScale > 1
      //     ? `დავამატეთ ×${suggestedScale} მასშტაბი, რადგან მოდელი ძალიან მცირე გამოვიდა. სურვილის შემთხვევაში შეცვალეთ ქვემოთ.`
      //     : ''
      // );
      setScaleMultiplier(suggestedScale);
    } catch (err) {
      console.error('Failed to parse STL file', err);
      setGeometry(null);
      setFileMeta(null);
      setError('STL ფაილის წაკითხვა ვერ მოხერხდა. დარწმუნდით, რომ ფაილი დაზიანებული არაფრით არის.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleColorChange = (nextColorId) => {
    setColorId(nextColorId);
  };

  const handleScaleInputChange = (event) => {
    const value = Number(event.target.value);
    if (!Number.isFinite(value) || value <= 0) {
      setScaleMultiplier(1);
    } else {
      setScaleMultiplier(value);
    }
    setAutoScaleNote('');
  };

  const applyQuickScale = (value) => {
    setScaleMultiplier(value);
    setAutoScaleNote('');
  };

  const handleVolumeChange = (vol) => {
    setVolumeMm3(vol);
  };

  const handleDimensionsChange = (dims) => {
    setDimensions(dims);
  };

  const clearSelection = () => {
    setGeometry(null);
    setFileMeta(null);
    setVolumeMm3(null);
    setDimensions(null);
    setScaleMultiplier(1);
    setAutoScaleNote('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitQuote = async (event) => {
    event.preventDefault();
    if (!pricingDetails || !fileMeta) {
      setSubmitState({ status: 'error', message: 'ფაილი ჯერ არ არის ატვირთული.' });
      return;
    }

    if (!email.trim()) {
      setSubmitState({ status: 'error', message: 'გთხოვთ მიუთითოთ ელფოსტა.' });
      return;
    }

    const payload = {
      email: email.trim(),
      notes: notes.trim(),
      material: selectedMaterial.label,
      materialId,
      color: selectedColor?.label ?? '',
      colorId,
      colorHex: selectedColor?.hex ?? '',
      fileName: fileMeta.name,
      fileSize: fileMeta.sizeInBytes,
      priceGel: pricingDetails.total,
      volumeMm3,
      effectiveVolumeCm3: pricingDetails.effectiveVolumeCm3,
      dimensions: dimensions ? { ...dimensions } : null,
      timestamp: new Date().toISOString(),
    };

    setSubmitState({ status: 'submitting' });

    if (!QUOTE_ENDPOINT) {
      console.log('Quote submission payload', payload);
      setSubmitState({ status: 'warning', message: 'ფარე მიჩნეულია. Endpoint არ არის მითითებული, მონაცემები ჩაიწერა კონსოლში.' });
      return;
    }

    try {
      const response = await fetch(QUOTE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setSubmitState({ status: 'success', message: 'შეთავაზება წარმატებით გაიგზავნა.' });
      setNotes('');
    } catch (submissionError) {
      console.error('Quote submission failed', submissionError);
      setSubmitState({ status: 'error', message: 'შეთავაზება ვერ გაიგზავნა. სცადეთ ხელახლა.' });
    }
  };

  const isSubmitting = submitState.status === 'submitting';
  const isSubmitDisabled = isSubmitting || !email.trim() || !pricingDetails;
  const statusColorMap = {
    success: '#2f7a4d',
    error: 'var(--color-red)',
    warning: '#c08427',
  };

  return (
    <div style={{ minHeight: '100vh', boxSizing: 'border-box', paddingBottom: '120px' }}>
      <div style={containerStyle}>
        <aside style={sidebarStyle}>
          <div style={infoCardStyle}>
            
            <div style={filePickerContainerStyle}>
              <label
                style={fileButtonStyle}
                onMouseEnter={(evt) => {
                  evt.currentTarget.style.transform = 'translateY(-1px) scale(1.01)';
                  evt.currentTarget.style.boxShadow = '0 18px 32px -18px rgba(231, 196, 106, 0.95)';
                }}
                onMouseLeave={(evt) => {
                  evt.currentTarget.style.transform = 'none';
                  evt.currentTarget.style.boxShadow = '0 12px 24px -15px rgba(231, 196, 106, 0.85)';
                }}
              >
                ატვირთე STL ფაილი
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".stl"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
              <span style={fileHintStyle}>
                {fileMeta ? `არჩეულია: ${fileMeta.name.slice(0, 20)}...` : 'მხარდაჭერილია მხოლოდ STL ფაილები.'}
              </span>
            </div>
            {geometry && (
              <button
                type="button"
                onClick={clearSelection}
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  background: palette.surfaceMuted,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  color: palette.text,
                  fontWeight: 600,
                }}
              >
                ფაილის გასუფთავება
              </button>
            )}
            {error && (
              <p style={{ marginTop: '12px', color: 'var(--color-red)' }}>{error}</p>
            )}
          </div>

          <div style={infoCardStyle}>
            <h3 style={{ marginTop: 0, color: palette.primary }}> მასშტაბი</h3>
          

            <label style={{ display: 'inline-block', fontSize: '14px', marginBottom: '6px', color: palette.text }}>მასშტაბის მულტიპლიკატორი</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={scaleMultiplier}
              onChange={handleScaleInputChange}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${palette.border}`,
                width: '100%',
                marginBottom: '12px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent:'space-between' }}>
              {[0.1, 1, 10, 100, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  style={{
                    ...quickScaleButtonStyle,
                    background: scaleMultiplier === preset ? palette.secondary : palette.surfaceMuted,
                    border: scaleMultiplier === preset ? `1px solid ${palette.secondary}` : quickScaleButtonStyle.border,
                    color: scaleMultiplier === preset ? palette.primary : palette.text,
                    fontWeight: scaleMultiplier === preset ? 600 : 500,
                  }}
                  onClick={() => applyQuickScale(preset)}
                  onMouseEnter={(evt) => {
                    evt.currentTarget.style.background = palette.secondary;
                    evt.currentTarget.style.border = `1px solid ${palette.secondary}`;
                    evt.currentTarget.style.color = palette.primary;
                  }}
                  onMouseLeave={(evt) => {
                    if (scaleMultiplier === preset) {
                      evt.currentTarget.style.background = palette.secondary;
                      evt.currentTarget.style.border = `1px solid ${palette.secondary}`;
                      evt.currentTarget.style.color = palette.primary;
                    } else {
                      evt.currentTarget.style.background = palette.surfaceMuted;
                      evt.currentTarget.style.border = quickScaleButtonStyle.border;
                      evt.currentTarget.style.color = palette.text;
                    }
                  }}
                >
                  ×{preset}
                </button>
              ))}
            </div>
            {autoScaleNote && (
              <p style={{ marginTop: '12px', fontSize: '13px', color: palette.textMuted, lineHeight: 1.5 }}>{autoScaleNote}</p>
            )}
          </div>

          <div style={infoCardStyle}>
            <h3 style={{ marginTop: 0, color: palette.primary }}>მასალა და ფერი</h3>
            <select
              value={materialId}
              onChange={(event) => setMaterialId(event.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${palette.border}`,
                fontSize: '14px',
              }}
            >
              {MATERIAL_PRESETS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label} · ₾{option.spoolPrice} / {option.spoolWeight}გ
                </option>
              ))}
            </select>
            {colorOptions.length ? (
              <div style={{ marginTop: '16px' }}>
                <div style={radioGroupStyle}>
                  {colorOptions.map((option) => {
                    const isSelected = colorId === option.id;
                    return (
                      <label
                        key={option.id}
                        style={{
                          ...radioOptionStyle,
                          ...(isSelected ? radioSelectedStyle : {}),
                        }}
                        title={option.label}
                        aria-label={option.label}
                        onMouseEnter={(evt) => {
                          evt.currentTarget.style.border = `2px solid ${palette.secondary}`;
                          evt.currentTarget.style.boxShadow = '0 0 0 4px rgba(231, 196, 106, 0.25)';
                          evt.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(evt) => {
                          if (isSelected) {
                            evt.currentTarget.style.border = radioSelectedStyle.border;
                            evt.currentTarget.style.boxShadow = radioSelectedStyle.boxShadow;
                            evt.currentTarget.style.transform = radioSelectedStyle.transform;
                          } else {
                            evt.currentTarget.style.border = radioOptionStyle.border;
                            evt.currentTarget.style.boxShadow = 'none';
                            evt.currentTarget.style.transform = 'none';
                          }
                        }}
                      >
                        <span style={swatchDotStyle(option.hex)} />
                        <input
                          type="radio"
                          name="color-selector"
                          value={option.id}
                          checked={isSelected}
                          onChange={() => handleColorChange(option.id)}
                          style={{ display: 'none' }}
                        />
                        <span style={srOnlyStyle}>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p style={{ marginTop: '12px', color: palette.textMuted, lineHeight: 1.55 }}>
                ამ მასალისთვის ფერი არ არის ხელმისაწვდომი.
              </p>
            )}
          </div>

          <div style={infoCardStyle}>
            <h3 style={{ marginTop: 0, color: palette.primary }}>ანგარიშება</h3>
            <p style={{ margin: '4px 0', fontSize: '14px', color: palette.textMuted }}>
              {fileMeta ? `${fileMeta.name.slice(0, 20)}...` : 'ფაილი არჩეული არ არის'}
            </p>
            <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
              <EstimateRow label="მოცულობა" value={volumeMm3 ? `${formatter.format(volumeMm3)} მმ³` : '—'} />
              <EstimateRow
                label="ეფექტური მოცულობა"
                value={pricingDetails ? `${cmFormatter.format(pricingDetails.effectiveVolumeCm3)} სმ³` : '—'}
              />
              <EstimateRow
                label="განზომილებები"
                value={
                  dimensions
                    ? `${formatter.format(dimensions.x)} × ${formatter.format(dimensions.y)} × ${formatter.format(dimensions.z)} მმ`
                    : '—'
                }
              />
              <EstimateRow
                label="დაახლოებითი ფასი"
                value={pricingDetails ? `₾${formatter.format(pricingDetails.total)}` : '—'}
              />
            </div>
          </div>

          <div style={infoCardStyle}>
            <h3 style={{ marginTop: 0, color: palette.primary }}>მიიღე პასუხი</h3>
            
            <form onSubmit={handleSubmitQuote} style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: palette.text }}>ელფოსტა</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  style={{ ...inputControlStyle }}
                  placeholder="name@example.com"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', color: palette.text }}>კომენტარი (არასავალდებულო)</label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  style={{ ...textAreaStyle }}
                  placeholder="როგორ გამოვიყენოთ დეტალი? გაქვთ დამატებითი მოთხოვნები?"
                />
              </div>
              <button
                type="submit"
                style={{
                  ...submitButtonStyle,
                  opacity: isSubmitDisabled ? 0.6 : 1,
                  cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
                }}
                disabled={isSubmitDisabled}
              >
                {isSubmitting ? 'იგზავნება...' : 'მოგვეწერე პასუხისთვის'}
              </button>
            </form>
            {submitState.status !== 'idle' && submitState.message && (
              <div
                style={{
                  ...statusMessageStyle,
                  color: statusColorMap[submitState.status] ?? palette.textMuted,
                }}
              >
                {submitState.message}
              </div>
            )}
            {!QUOTE_ENDPOINT && (
              <div style={{ ...statusMessageStyle, color: '#c08427' }}>
                ⚠️ Quote endpoint არ არის მითითებული. შედეგი იხილე ბრაუზერის კონსოლში.
              </div>
            )}
          </div>
        </aside>

        <section style={canvasWrapperStyle}>
          {geometry ? (
        <Canvas
              shadows
              camera={{ position: [12, 8, 12], fov: 50, near: 0.1, far: 1000 }}
          onCreated={({ gl }) => {
            gl.shadowMap.enabled = true;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
          }}
            >
              <color attach="background" args={[palette.canvas]} />
              <hemisphereLight args={['#fdfdfd', '#2c3a2d', 0.7]} />
              <directionalLight
                position={[10, 14, 12]}
                intensity={1}
                castShadow
                shadow-mapSize={[2048, 2048]}
                color={palette.secondary}
              />
              <gridHelper args={[20, 20, '#5a6c5e', '#1f3022']} />
              <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <shadowMaterial opacity={0.22} />
              </mesh>
              <Model
                geometry={geometry}
                userScale={scaleMultiplier}
                color={modelColorHex}
                onVolumeChange={handleVolumeChange}
                onDimensionsChange={handleDimensionsChange}
              />
              <OrbitControls
                enablePan
                maxPolarAngle={(85 / 180) * Math.PI}
                minDistance={4}
                maxDistance={40}
              />
        </Canvas>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: palette.secondary,
                fontSize: '18px',
              }}
            >
              ატვირთეთ STL ფაილი წინასწარი ნახვისთვის
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EstimateRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', color: palette.text }}>
      <span style={{ color: palette.textMuted }}>{label}</span>
      <span style={{ fontWeight: 600, color: palette.primary }}>{value}</span>
    </div>
  );
}

export default STLViewer;
