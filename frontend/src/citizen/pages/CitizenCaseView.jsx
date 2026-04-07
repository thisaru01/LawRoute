import { useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

import { useCaseView } from "@/hooks/cases/useCaseView";
import { CaseProvider } from "@/lawyer/components/cases/CaseContext";
import CaseOverview from "@/lawyer/components/cases/CaseOverview";
import CaseMeetings from "@/lawyer/components/cases/CaseMeetings";
import CaseDocuments from "@/lawyer/components/cases/CaseDocuments";

// Static — generated once at module load, never changes
const TIME_OPTIONS = (() => {
  const times = [];
  for (let h = 0; h < 24; h++)
    for (let m = 0; m < 60; m += 30)
      times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  return times;
})();

export default function CitizenCaseDetails() {
  const caseViewData = useCaseView();

  const contextValue = useMemo(
    () => ({ ...caseViewData, timeOptions: TIME_OPTIONS }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      caseViewData.caseId,
      caseViewData.caseDetails,
      caseViewData.caseLoading,
      caseViewData.caseError,
      caseViewData.citizenName,
      caseViewData.citizenEmail,
      caseViewData.createdAtLabel,
      caseViewData.summary,
      caseViewData.normalizedStatus,
      caseViewData.label,
      caseViewData.meetings,
      caseViewData.meetingsLoading,
      caseViewData.meetingsError,
      caseViewData.isScheduling,
      caseViewData.scheduleForm,
      caseViewData.handleScheduleChange,
      caseViewData.handleScheduleConfirm,
      caseViewData.documents,
      caseViewData.documentsLoading,
      caseViewData.documentsError,
      caseViewData.isUploading,
      caseViewData.selectedFile,
      caseViewData.handleSelectFile,
      caseViewData.handleUploadDocumentConfirm,
      caseViewData.isUpdating,
      caseViewData.handleUpdateDocument,
      caseViewData.isClosing,
      caseViewData.closeError,
      caseViewData.handleCloseCase,
      caseViewData.canManageCase,
      caseViewData.canScheduleMeetings,
      caseViewData.canCloseCase,
    ],
  );

  return (
    <CaseProvider value={contextValue}>
      <div className="space-y-4">
        <Tabs defaultValue="overview">
          <TabsList variant="line">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <Card className="mt-4">
            <CardContent className="pt-6">
              <TabsContent value="overview">
                <CaseOverview />
              </TabsContent>
              <TabsContent value="meetings">
                <CaseMeetings />
              </TabsContent>
              <TabsContent value="documents">
                <CaseDocuments />
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </CaseProvider>
  );
}
