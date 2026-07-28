import { LETTER_TEMPLATES } from '../data/initialMockData';

export async function generateLetterDraft(
  templateId: string,
  inputs: Record<string, string>
): Promise<string> {
  const template = LETTER_TEMPLATES.find((t) => t.id === templateId);
  const templateTitle = template ? template.title : 'Formal Request';

  try {
    const res = await fetch('/api/drafts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, templateTitle, inputs }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.content) {
        return data.content;
      }
    }
  } catch (err) {
    console.warn('API call failed, using offline fallback draft generator:', err);
  }

  // Fallback template builder
  const recipient =
    inputs.landlordName || inputs.managerName || inputs.committeeName || inputs.recruiterName || 'To Whom It May Concern';
  const sender = 'Jane Doe';

  if (templateId === 'tpl-1') {
    return `FORMAL COMPLAINT NOTICE\n\nDate: ${new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })}\n\nTo: ${recipient}\nProperty Address: ${
      inputs.propertyAddress || 'Current Residence'
    }\n\nDear ${recipient},\n\nI am writing to formally log a complaint regarding property maintenance issues at ${
      inputs.propertyAddress || 'my leased premises'
    }.\n\nIssue Details:\n${
      inputs.issueType || 'Unresolved plumbing and electrical concerns requiring technical repair.'
    }\n\nExpected Resolution:\nPlease take necessary action to repair and resolve this issue by ${
      inputs.desiredDeadline || 'within 5 business days'
    }.\n\nThank you for your prompt co-operation.\n\nSincerely,\n${sender}`;
  }

  return `SUBJECT: Request Regarding ${templateTitle}\n\nDate: ${new Date().toLocaleDateString()}\n\nDear ${recipient},\n\nI am reaching out regarding ${
    inputs.reason || inputs.issueType || inputs.positionTitle || 'the matter noted above'
  }.\n\nThank you for your time and assistance.\n\nBest regards,\n${sender}`;
}
