"use strict";

define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'services/ajaxService' + window.__env.minUrl], function (app) {

        app.service('sharedService', ['$rootScope', 'ajaxService', function ($root, $ajx) {

            var servieUrl = window.__env.apiUrl + '/api/';

            this.LoginToServer = function (postdata, successFunction, errorFunction) {
                var headerType = 'application/x-www-form-urlencoded';
                $ajx.AjaxPost3(postdata, headerType, servieUrl + 'common/login', successFunction, errorFunction);
            };
            this.LogoutFromServer = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Common/Logout", successFunction, errorFunction);
            };
            this.GetJsonFile = function (jsonfile, successFunction, errorFunction) {
                $ajx.AjaxGetJsonFile(jsonfile, successFunction, errorFunction);
            };
            this.GetLoggedInUser = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Common/GetLoggedInUser", successFunction, errorFunction);
            };
            this.ForgotPassword = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Common/ForgotPassword?email=" + postdata, successFunction, errorFunction);
            };
            this.ChangePassword = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Common/ChangePassword", successFunction, errorFunction);
            };
            this.ReSendConfirmationEmail = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Company/ReSendConfirmationEmail", successFunction, errorFunction);
            };
            this.UploadContents = function (content, successFunction, errorFunction) {
                $ajx.AjaxPost3(content, undefined, servieUrl + "Common/FileUpload", successFunction, errorFunction);
            };
            this.DeletePhoto = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Common/DeletePhoto", successFunction, errorFunction);
            };
            this.ContactToTeam = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "common/ContactUs", successFunction, errorFunction);
            };
            this.RequestDemo = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "common/RequestDemo", successFunction, errorFunction);
            };
            this.GetNameByEmail = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Common/GetNameByEmail", successFunction, errorFunction);
            };
            this.GetLookUpByEmail = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Common/GetLookUpByEmail", successFunction, errorFunction);
            };
            this.GetCandidateById = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Common/GetCandidateById?id=" + postdata, successFunction, errorFunction);
            };
            this.GetEvaluatorById = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Common/GetEvaluatorById?id=" + postdata, successFunction, errorFunction);
            };
            this.GetSessionValidate = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Common/GetSessionValidate", successFunction, errorFunction);
            };
            this.GetSessionDocuments = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Common/GetSessionDocuments", successFunction, errorFunction);
            };
            this.UpdateTimeZones = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Common/UpdateTimeZones", successFunction, errorFunction);
            };
            this.AddCodeChallenge = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Common/AddCodeChallenge", successFunction, errorFunction);
            };

            /* Profile related methods */
            this.GetProfileContact = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Contact/GetProfileContact", successFunction, errorFunction);
            };
            this.SetProfileContact = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Contact/SetProfileContact", successFunction, errorFunction);
            };
            /* Contact Related methods */
            this.GetContactInfo = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Contact/GetContactInfo", successFunction, errorFunction);
            };

            /* Session Related methods */

            this.GetSessionsCount = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Session/GetSessionsCount", successFunction, errorFunction);
            };
            this.GetSessionsByStatus = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Session/GetSessionsByStatus", successFunction, errorFunction);
            };
            this.GetSessionsByDay = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Session/GetSessionsByDay", successFunction, errorFunction);
            };
            this.GetSessionsByTime = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Session/GetSessionsByTime", successFunction, errorFunction);
            };
            this.GetSessionsByMonthly = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Session/GetSessionsByMonthly", successFunction, errorFunction);
            };
            this.AddSession = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Session/AddSession", successFunction, errorFunction);
            };
            this.GetAllsessions = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Session/GetAllsessions", successFunction, errorFunction);
            };
            this.GetCompletedSession = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Session/GetCompletedSession?id=" + postdata, successFunction, errorFunction);
            };
            this.CancelSessions = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Session/CancelSessions", successFunction, errorFunction);
            };
            this.DeleteSessions = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Session/DeleteSessions", successFunction, errorFunction);
            };
            this.DeleteSessionResume = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Session/DeleteSessionResume", successFunction, errorFunction);
            };

            this.GetCancelSessionReason = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Session/GetCancelSessionReason?id=" + postdata, successFunction, errorFunction);
            };
            this.GetNewFeedBack = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Session/GetNewFeedBack", successFunction, errorFunction);
            };
            this.SetFeedBack = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Session/UpdateFeedBack", successFunction, errorFunction);
            };
            this.SharedSession = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Session/SharedSession", successFunction, errorFunction);
            };
            this.SetSharedList = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Session/SetSharedList", successFunction, errorFunction);
            };
            this.SetSharingApproval = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Session/SetSharingApproval", successFunction, errorFunction);
            };
            this.AddBulkSession = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Session/AddBulkSession", successFunction, errorFunction);
            };
            this.ValidateSession = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Session/ValidateSession", successFunction, errorFunction);
            };
            this.RescheduledSession = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Session/RescheduledSession", successFunction, errorFunction);
            };

            this.AddBulkFileUpload = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost3(postdata, undefined, servieUrl + "Common/MultipleFilesUpload", successFunction, errorFunction);
            };

            /* Interviewer Related Methods */
            this.GetAllInterviewers = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Interviewer/GetAllInterviewers", successFunction, errorFunction);
            };
            this.AddInterviewer = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Interviewer/AddInterviewer", successFunction, errorFunction);
            };

            /* Candidate Related Methods */
            this.GetAllCandidates = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Candidate/GetAllCandidates", successFunction, errorFunction);
            };
            this.GetCandidate = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Candidate/GetCandidate?id=" + postdata, successFunction, errorFunction);
            };
            this.GetCandidateByType = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Candidate/GetCandidateByType?id=" + postdata, successFunction, errorFunction);
            };
            this.GetEvaluator = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Candidate/GetEvaluator?id=" + postdata, successFunction, errorFunction);
            };
            this.GetHGCandidate = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Candidate/GetFaceItCandidate?id=" + postdata, successFunction, errorFunction);
            };
            this.UpdateCandidate = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Candidate/UpdateCandidate", successFunction, errorFunction);
            };
            this.GetNotes = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Common/GetNotes?id=" + postdata, successFunction, errorFunction);
            };
            this.AddNotes = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Common/AddNotes", successFunction, errorFunction);
            };
            this.AddCandidate = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Candidate/AddCandidate", successFunction, errorFunction);
            };
            this.GetCandidateBySession = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Candidate/GetCandidateBySession", successFunction, errorFunction);
            };

            this.SetCSharedList = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Candidate/SetSharedList", successFunction, errorFunction);
            };
            this.DeleteCandidate = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Candidate/DeleteCandidate?id=" + postdata, successFunction, errorFunction);
            };

            this.GeLanguages = function (jsonfile, successFunction, errorFunction) {
                $ajx.AjaxGetJsonFile(jsonfile, successFunction, errorFunction);
            };

            /* Registration Related Methods */
            this.SendOTPCode = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Common/SendOTP", successFunction, errorFunction);
            };
            this.ConfirmOTPCode = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Common/ConfirmOTPCode?number=" + postdata, successFunction, errorFunction);
            };
            this.RegisterCompany = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Company/Register", successFunction, errorFunction);
            };

            this.GetShortCompany = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Company/GetShortCompany", successFunction, errorFunction);
            };

            this.GetCompanyInfo = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Company/GetCompanyInfo", successFunction, errorFunction);
            };

            this.GetCompanyDetails = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Company/GetCompanyDetails", successFunction, errorFunction);
            };

            this.SetCompanyDetails = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Company/Update", successFunction, errorFunction);
            };

            this.AddCompanyUser = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Company/AddCompanyUser", successFunction, errorFunction);
            };

            this.GetCompanyUsers = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Company/GetCompanyUsers", successFunction, errorFunction);
            };

            this.ChangeCompanyUserState = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Company/ChangeCompanyUserState", successFunction, errorFunction);
            };

            this.UpdateCompanyUserRole = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Company/UpdateCompanyUserRole", successFunction, errorFunction);
            };

            this.GetJobHeaders = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "job/GetJobHeaders", successFunction, errorFunction);
            };

            this.GetMyTasks = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "job/GetMyTasks", successFunction, errorFunction);
            };

            this.GetFeedBackForNewJob = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "job/GetFeedBackForNewJob?jobId=" + postdata, successFunction, errorFunction);
            };

            this.GetJobShortHeaders = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "job/GetJobShortHeaders", successFunction, errorFunction);
            };


            this.GetJobDetails = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "job/GetJobDetails?jobId=" + postdata, successFunction, errorFunction);
            };

            this.GetJobFullDetails = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "job/GetJobFullDetails?jobId=" + postdata, successFunction, errorFunction);
            };

            this.GetJobAssignees = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "job/GetJobAssignees", successFunction, errorFunction);
            };

            this.CreateNewJob = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "job/CreateNewJob", successFunction, errorFunction);
            };

            this.UpdateExistingJob = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "job/UpdateExistingJob", successFunction, errorFunction);
            };

            this.PublishExistingJob = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "job/PublishExistingJob", successFunction, errorFunction);
            };

            this.GetJobInfo = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "job/GetJobInfo", successFunction, errorFunction);
            };

            this.GetUserJobInfo = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "job/GetUserJobInfo", successFunction, errorFunction);
            };

            this.GetJobList = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "job/GetJobList", successFunction, errorFunction);
            };

            this.UpdateJobContact = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "job/UpdateJobContact", successFunction, errorFunction);
            };

            this.UpdateJobEndDate = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "job/UpdateJobEndDate", successFunction, errorFunction);
            };

            this.GetJobStatistics = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "job/GetJobStatistics", successFunction, errorFunction);
            };

            this.GetAllScheduledJobs = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "job/GetAllScheduledJobs", successFunction, errorFunction);
            };

            this.GetJobImport = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "job/GetJobImport?file=" + postdata, successFunction, errorFunction);
            };

            this.AddTest = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Pretest/AddTest", successFunction, errorFunction);
            };

            this.DeleteQHeaders = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Pretest/DeleteQHeaders", successFunction, errorFunction);
            };

            this.GetTest = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Pretest/GetTest?id=" + postdata, successFunction, errorFunction);
            };

            this.PublishTest = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Pretest/PublishTest", successFunction, errorFunction);
            };

            this.AddQItem = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Pretest/AddQItem", successFunction, errorFunction);
            };

            this.GetQItems = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Pretest/GetQItems", successFunction, errorFunction);
            };

            this.AddQHeader = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Pretest/AddQHeader", successFunction, errorFunction);
            };

            this.AddQHeaders = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxPost(postdata, servieUrl + "Pretest/AddQHeaders", successFunction, errorFunction);
            };

            this.GetQHeaders = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Pretest/GetQHeaders?id=" + postdata, successFunction, errorFunction);
            };

            this.GetQBankHeaders = function (postdata, successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Pretest/GetQBankHeaders?id=" + postdata, successFunction, errorFunction);
            };

            this.GetAllTestsByCompany = function (successFunction, errorFunction) {
                $ajx.AjaxGet(servieUrl + "Pretest/GetAllTestsByCompany", successFunction, errorFunction);
            };
        }]);
    });