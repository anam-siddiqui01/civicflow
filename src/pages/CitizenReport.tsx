import { ArrowRight, Check, Clock3, ImagePlus, LoaderCircle, MapPin, Mic, ShieldCheck, UploadCloud, X } from 'lucide-react'
import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, PageHeader, StatusBadge, Toast } from '../components/ui'
import { createCitizenReport, getIssueClusters } from '../data/repository'
import { analyzeCitizenReport } from '../services/aiService'
import type { CitizenReport } from '../types'

const categories = ['Water & Sanitation', 'Roads', 'Garbage', 'Electricity', 'Streetlights', 'Healthcare', 'Public Safety', 'Parking / Traffic', 'Other']
const demoTranscript = 'Vehicles are regularly parked across the narrow lane near the community center, making it difficult for residents and emergency vehicles to pass.'
type FieldName = 'description' | 'category' | 'location' | 'photo'

export function CitizenReportPage() {
  const [submitted, setSubmitted] = useState<CitizenReport | null>(null)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [location, setLocation] = useState('')
  const [ward, setWard] = useState('')
  const [inputType, setInputType] = useState<CitizenReport['inputType']>('Text')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageName, setImageName] = useState('')
  const [imageLoading, setImageLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [submissionError, setSubmissionError] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const closeToast = useCallback(() => setToastMessage(''), [])
  const matchedIssue = submitted?.issueClusterId ? getIssueClusters().find((issue) => issue.id === submitted.issueClusterId) : undefined

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErrors((current) => ({ ...current, photo: 'Choose an image file.' }))
      return
    }
    if (file.size > 1_000_000) {
      setErrors((current) => ({ ...current, photo: 'Choose an image smaller than 1 MB for local demo storage.' }))
      event.target.value = ''
      return
    }

    setErrors((current) => ({ ...current, photo: undefined }))
    setImageLoading(true)
    setImageName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(typeof reader.result === 'string' ? reader.result : null)
      setImageLoading(false)
    }
    reader.onerror = () => {
      setErrors((current) => ({ ...current, photo: 'This image could not be previewed. Try another file.' }))
      setImageName('')
      setImageLoading(false)
    }
    try {
      reader.readAsDataURL(file)
    } catch {
      setErrors((current) => ({ ...current, photo: 'This image could not be previewed. Try another file.' }))
      setImageName('')
      setImageLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmissionError('')
    const nextErrors: Partial<Record<FieldName, string>> = {}
    if (!description.trim()) nextErrors.description = 'Describe the issue before submitting.'
    if (!category) nextErrors.category = 'Choose an issue category.'
    if (!location.trim() && !ward) nextErrors.location = 'Add a location or select a ward.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || imageLoading) return

    setSubmitting(true)
    try {
      const reportInput = {
        description: description.trim(),
        category,
        location: location.trim() || `Ward ${ward}`,
        ward: ward ? Number(ward) : null,
        imageUrl: imagePreview,
        inputType: imagePreview ? 'Photo' as const : inputType,
      }
      const analysis = await analyzeCitizenReport(reportInput)
      const report = createCitizenReport({
        ...reportInput,
        analysis,
      })
      setSubmitted(report)
      setToastMessage('Your report has been received.')
    } catch {
      setSubmissionError('We could not finish submitting your report. Please try again; your entries are still here.')
    } finally {
      setSubmitting(false)
    }
  }

  function startAnotherReport() {
    setSubmitted(null)
    setDescription('')
    setCategory('')
    setLocation('')
    setWard('')
    setInputType('Text')
    setImagePreview(null)
    setImageName('')
    setErrors({})
    setSubmissionError('')
  }

  return <>
    <PageHeader eyebrow={<><MapPin size={13} /> Citizen services</>} title={submitted ? 'Report received' : 'Tell us what needs attention'} description={submitted ? 'Your report has been received and is now being reviewed.' : 'Share an issue in your neighborhood so your constituency office can understand what is happening.'} />
    {submitted ? <Card className="confirmation">
      <div className="confirm-mark"><Check size={25} /></div>
      <div className="eyebrow" style={{ justifyContent: 'center' }}>Report received</div>
      <h2 className="page-title" style={{ fontSize: 22, marginTop: 10 }}>Your report is in the system.</h2>
      <p className="page-description">Your report has been received and is now being reviewed.</p>
      <div className="reference-box">{submitted.id}</div>
      <div className="confirmation-details">
        <div><span>Issue</span><strong>{matchedIssue?.title ?? submitted.category}</strong></div>
        <div><span>Location</span><strong>{submitted.location}{submitted.ward ? ` · Ward ${submitted.ward}` : ''}</strong></div>
        <div><span>Status</span><StatusBadge status={submitted.status} /></div>
      </div>
      {submitted.analysis && <section className="analysis-panel" aria-label="AI-assisted classification results">
        <div className="section-heading"><div><h3 className="section-title">AI-assisted classification</h3><p className="section-caption">Deterministic demo analysis · officer review remains final</p></div><span className="badge status-under-review">Decision support</span></div>
        <div className="analysis-grid">
          <div className="analysis-field"><span>Detected category</span><strong>{submitted.analysis.category}</strong></div>
          <div className="analysis-field"><span>Detected language</span><strong>{submitted.analysis.detectedLanguage}</strong></div>
          <div className="analysis-field"><span>Detected location</span><strong>{submitted.analysis.location}</strong></div>
          <div className="analysis-field"><span>Urgency · severity</span><strong>{submitted.analysis.urgency} · {submitted.analysis.severity}</strong></div>
          <div className="analysis-field"><span>Estimated affected population</span><strong>About {submitted.analysis.affectedPopulationEstimate.toLocaleString()}</strong></div>
          <div className="analysis-field"><span>Suggested department</span><strong>{submitted.analysis.suggestedDepartment}</strong></div>
        </div>
        <div className="analysis-copy"><span>Issue summary</span><p>{submitted.analysis.summary}</p></div>
        {submitted.analysis.evidence.length > 0 && <div className="analysis-copy"><span>Evidence signals</span><p>{submitted.analysis.evidence.join(' · ')}</p></div>}
        <div className="analysis-copy"><span>AI recommended action</span><p>{submitted.analysis.recommendedAction}</p><small>Officer confirmation required.</small></div>
        {matchedIssue && <div className="related-issue"><Check size={14} /><span><strong>{matchedIssue.reportCount} related reports</strong> connected to {matchedIssue.title}, Ward {matchedIssue.ward}</span></div>}
      </section>}
      <div className="notice-box confirmation-next"><div><strong>Next step</strong><br />CivicFlow will group related reports and help the constituency office identify the appropriate action.</div></div>
      {matchedIssue && <p className="footer-note">Related issue cluster · {matchedIssue.title} · {matchedIssue.reportCount} reports</p>}
      <div className="confirmation-actions"><Link className="button button-primary" to={`/track/${submitted.id}`}>Track this report <ArrowRight size={14} /></Link><Button variant="secondary" onClick={startAnotherReport}>Report another issue</Button></div>
    </Card> : <div className="form-layout">
      <Card className="form-card"><form onSubmit={handleSubmit} className="form-fields" noValidate>
        <div>
          <label className="form-label" htmlFor="description">What is happening? <span className="form-help">Required</span></label>
          <textarea id="description" className="field-textarea" value={description} onChange={(event) => { setDescription(event.target.value); setErrors((current) => ({ ...current, description: undefined })) }} maxLength={800} aria-invalid={Boolean(errors.description)} placeholder="Describe the issue, when you noticed it, and who may be affected…" />
          {errors.description && <p className="form-error" role="alert">{errors.description}</p>}
          <div className="form-help" style={{ textAlign: 'right', marginTop: 5 }}>{description.length}/800</div>
        </div>
        <div className="form-two">
          <div><label className="form-label" htmlFor="category">Issue category <span className="form-help">Required</span></label><select id="category" className="field-select" value={category} onChange={(event) => { setCategory(event.target.value); setErrors((current) => ({ ...current, category: undefined })) }} aria-invalid={Boolean(errors.category)}><option value="">Choose a category</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>{errors.category && <p className="form-error" role="alert">{errors.category}</p>}</div>
          <div><label className="form-label" htmlFor="ward">Ward <span className="form-help">Location or ward required</span></label><select id="ward" className="field-select" value={ward} onChange={(event) => { setWard(event.target.value); if (event.target.value) setErrors((current) => ({ ...current, location: undefined })) }}><option value="">Select ward</option>{Array.from({ length: 12 }, (_, index) => index + 1).map((item) => <option key={item} value={item}>Ward {item}</option>)}</select></div>
        </div>
        <div>
          <label className="form-label" htmlFor="location">Location or nearby landmark <span className="form-help">Required if ward is unknown</span></label>
          <div style={{ position: 'relative' }}><MapPin size={15} color="#87938a" style={{ position: 'absolute', left: 12, top: 14 }} /><input id="location" className="field-input" style={{ paddingLeft: 36 }} value={location} onChange={(event) => { setLocation(event.target.value); if (event.target.value.trim()) setErrors((current) => ({ ...current, location: undefined })) }} maxLength={120} aria-invalid={Boolean(errors.location)} placeholder="Near Community Center, Ward 8" /></div>
          {errors.location && <p className="form-error" role="alert">{errors.location}</p>}
        </div>
        <div>
          <div className="form-label">Add a photo <span className="form-help">Optional · stored in this browser</span></div>
          <label className="upload-zone" htmlFor="photo"><span className="upload-copy"><span className="upload-icon"><ImagePlus size={16} /></span><span>{imageLoading ? 'Preparing preview…' : imageName || 'Attach a photo of the issue'}<span className="form-help" style={{ display: 'block', marginTop: 3 }}>JPG or PNG · up to 1 MB</span></span></span><span className="button button-secondary button-small"><UploadCloud size={13} /> Choose</span><input id="photo" type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={handlePhotoChange} /></label>
          {imagePreview && <div className="report-photo-preview"><img src={imagePreview} alt="Selected issue evidence preview" /><div><strong>{imageName}</strong><span>Ready to attach to this report</span></div><button className="icon-button" type="button" aria-label="Remove photo" onClick={() => { setImagePreview(null); setImageName('') }}><X size={14} /></button></div>}
          {errors.photo && <p className="form-error" role="alert">{errors.photo}</p>}
        </div>
        <div>
          <div className="form-label">Voice report <span className="form-help">Demo fallback · no speech recognition</span></div>
          <div className="voice-placeholder"><span style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span className="upload-icon"><Mic size={15} /></span><span><strong>Voice input is not enabled here</strong><span>Insert an editable demo transcript instead.</span></span></span><Button type="button" variant="secondary" size="small" icon={<Mic size={13} />} onClick={() => { setDescription(demoTranscript); setInputType('Voice'); setErrors((current) => ({ ...current, description: undefined })) }}>Use demo transcript</Button></div>
        </div>
        {submissionError && <p className="form-error" role="alert">{submissionError}</p>}
        <Button type="submit" disabled={submitting || imageLoading} icon={submitting ? <LoaderCircle className="spin" size={15} /> : <ArrowRight size={15} />}>{submitting ? 'Submitting report…' : 'Submit report'}</Button>
        <p className="footer-note" style={{ marginTop: -10 }}><ShieldCheck size={11} style={{ verticalAlign: 'middle' }} /> Demo data is saved in this browser only. No official service request is sent.</p>
      </form></Card>
      <Card className="form-side"><div className="eyebrow"><Clock3 size={13} /> What happens next</div><h2 className="section-title" style={{ marginTop: 11 }}>A clearer path from report to response.</h2><div className="step-list"><div className="step-item"><span className="step-number">1</span><div><strong>Get a reference</strong><p>Use your ID to revisit the status of this report.</p></div></div><div className="step-item"><span className="step-number">2</span><div><strong>Office review</strong><p>Related reports can be grouped to help officers coordinate a response.</p></div></div><div className="step-item"><span className="step-number">3</span><div><strong>See the next step</strong><p>Any action timing is expected until an officer confirms it.</p></div></div></div><div className="notice-box" style={{ marginTop: 19 }}><ShieldCheck size={14} /> For emergencies or immediate danger, contact local emergency services directly.</div></Card>
    </div>}
    {toastMessage && <Toast message={toastMessage} onClose={closeToast} />}
  </>
}