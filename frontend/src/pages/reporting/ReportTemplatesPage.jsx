import React, { useState } from 'react';
import { useReportTemplates, useGeneratedReports } from '../../hooks/reporting';
import { ReportTemplateGrid, ReportGeneratorModal } from '../../components/reporting';

export const ReportTemplatesPage = () => {
  const { templates, duplicateTemplate } = useReportTemplates(true);
  const { generateReport } = useGeneratedReports();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);

  const handleOpenGenerator = (template) => {
    setSelectedTemplate(template);
    setIsGeneratorOpen(true);
  };

  const handleDuplicate = (template) => {
    const newCode = `${template.code}_copy_${Date.now().toString().slice(-4)}`;
    duplicateTemplate(template.id, newCode, `${template.name} (Copy)`);
  };

  const handleGenerateSubmit = (params) => {
    generateReport(params.reportType, params.format, params.filters, params.title, params.asyncMode);
  };

  return (
    <div className="reporting-app">
      <div className="reporting-header">
        <div>
          <h1 className="reporting-title">Report Templates Library</h1>
          <p className="reporting-subtitle">
            Browse and generate standard system and production report templates
          </p>
        </div>
      </div>

      <ReportTemplateGrid
        templates={templates}
        onGenerate={handleOpenGenerator}
        onDuplicate={handleDuplicate}
      />

      <ReportGeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        template={selectedTemplate}
        onSubmit={handleGenerateSubmit}
      />
    </div>
  );
};

export default ReportTemplatesPage;
