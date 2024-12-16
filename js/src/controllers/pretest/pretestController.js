
define(['faceitConsApp' + window.__env.minUrl
    , window.__env.baseUrl + 'shared/sharedController' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedMethod' + window.__env.minUrl
    , window.__env.baseUrl + 'services/sharedService' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/range' + window.__env.minUrl
    , window.__env.baseUrl + 'directives/ngSelect' + window.__env.minUrl
], function (app) {

    "use strict";

    app.controller("pretestController",
        ['$scope', '$rootScope', 'sharedService', 'sharedMethod', '$routeParams',
            function ($scope, $root, $ajx, $support, $params) {

                var queryId = $params.Id || 0;

                /* New Test variables */
                $scope.testId = 0;
                $scope.testTitle = '';
                $scope.testDesc = '';
                $scope.testJobId = 0;
                $scope.jb = [];

                /* Default Category List */
                $scope.CategoryList = [
                    { Id: 0, Name: 'Select' },
                    { Id: 1, Name: 'Multi Choice' },
                    { Id: 2, Name: 'Single Choice' },
                    { Id: 3, Name: 'Text Box' },
                    { Id: 4, Name: 'Paragraph' },
                    { Id: 5, Name: 'Code Test' }
                ];

                $scope.CategoryList2 = [
                    { Id: 0, Name: 'Category' },
                    { Id: 1, Name: 'Multi Choice' },
                    { Id: 2, Name: 'Single Choice' },
                    { Id: 3, Name: 'Text Box' },
                    { Id: 4, Name: 'Paragraph' },
                    { Id: 5, Name: 'Code Test' }
                ];

                /* Choice list */

                function defaultChoiceList() {

                    $scope.MultiChoice = {
                        Marks: 0,
                        Time: 0,
                        Question: '',
                        AllowMultiples: false,
                        SaveToBank: false,
                        Mandatory: false,
                        Answers: []
                    };

                    $scope.SingleChoice = {
                        Marks: 0,
                        Time: 0,
                        Question: '',
                        SaveToBank: false,
                        Mandatory: false,
                        Answers: []
                    };

                    $scope.TextBoxChoice = {
                        Marks: 0,
                        Time: 0,
                        Question: ''
                    };

                    $scope.ParaChoice = {
                        Marks: 0,
                        Time: 0,
                        Question: ''
                    };

                    $scope.CodeChoice = {
                        Marks: 0,
                        Time: 0,
                        Question: '',
                        LanguageId: 0,
                        Challenge: ''
                    };

                    $scope.AllowAddNewMultiple = true;
                    $scope.AllowAddNewSingle = true;
                }

                defaultChoiceList();

                /* Existing Test variables */
                $scope.categoryId = 0;
                $scope.subjectId = 0;
                $scope.sectionId = 0;
                $scope.SubjectName = '';
                $scope.SectionName = '';
                $scope.AllowAddNewMultiple = true;
                $scope.AllowAddNewSingle = true;

                $scope.QuestionsBk = [];
                $scope.Questions = [];
                $scope.TestInfo = [];
                $scope.SectionsList = [];
                $scope.SubjectsList = [];
                $scope.LanguagesPack = [];
                $scope.CategoryDisabled = true;

                $scope.TotalMarks = 0;
                $scope.TotalTime = 0;
                $scope.TotalQuestions = 0;
                $scope.DeleteEnabled = 0;

                $scope.OnDefaultLoad = function () {
                    resetValues();
                    if (queryId > 0) {
                        loadSelectedTest(queryId);
                    } else {
                        // default layout
                        getJobsList();
                    }
                };

                /* Load All Jobs */
                function getJobsList() {
                    $support.start();
                    //$scope.jb = [
                    //    { Id: 62, Text: 'JB00062', Description: 'Test 1' }
                    //];
                    //loadDefaultLayout();
                    //$support.stop();
                    $ajx.GetJobInfo(function (res) {
                        $support.stop();
                        if ($support.IsSuccess(res)) {
                            $scope.jb = res.data.Results;
                            loadDefaultLayout();
                        }
                    }, function (res) {
                        console.log(res);
                        $support.stop();
                    });
                }

                function resetValues() {
                    $scope.testId = 0;
                    $scope.testTitle = '';
                    $scope.testDesc = '';
                    $scope.testJobId = 0;
                    $scope.jb = [];

                    $scope.categoryId = 0;
                    $scope.subjectId = 0;
                    $scope.sectionId = 0;
                    $scope.SubjectName = '';
                    $scope.SectionName = '';
                    $scope.QuestionsBk = [];
                    $scope.Questions = [];
                    $scope.TestInfo = [];
                    $scope.SectionsList = [];
                    $scope.SubjectsList = [];
                    $scope.LanguagesPack = [];

                    $scope.CategoryDisabled = true;
                    $scope.AllowAddNewMultiple = true;
                    $scope.AllowAddNewSingle = true;

                    defaultChoiceList();
                }

                function loadDefaultLayout() {
                    $support.Show('dvDisplayTestNoContentBlock');
                    $support.Show('dvTestTitleBlock');
                }

                /* On new test clicked  */
                $scope.OnBuildTestClicked = function () {
                    AddErrorMessage('errorTestCreate', '', false);

                    if ($support.IsNull($scope.testTitle)) {
                        AddErrorMessage('errorTestCreate', 'Fill mandatory fields and try again', true);
                        return;
                    } else if ($support.IsNull($scope.testDesc)) {
                        AddErrorMessage('errorTestCreate', 'Fill mandatory fields and try again', true);
                        return;
                    } else if (parseFloat($scope.testJobId) === 0) {
                        AddErrorMessage('errorTestCreate', 'Fill mandatory fields and try again', true);
                        return;
                    }
                    var data = {
                        Title: $scope.testTitle,
                        Description: $scope.testDesc,
                        JobId: $scope.testJobId
                    };

                    $support.start();
                    $ajx.AddTest(data, function (res) {
                        if ($support.IsFailed(res)) {
                            if (res.data.statusText === 'EXIST') {
                                res.data.statusText = "\"" + $scope.testTitle + "\" alreay exist!";
                            }
                            AddErrorMessage('errorTestCreate', res.data.statusText, true);
                        } else if ($support.IsSuccess(res)) {
                            $root.NavigateToRoute('ps/' + res.data.Results);
                        }
                    }, function (err) {
                        console.log(err);
                        AddErrorMessage('errorTestCreate', err.data.statusText, true);
                        $support.stop();
                    });
                };

                /* Load Selected Test */
                function loadSelectedTest(keyId) {
                    $support.start();
                    $ajx.GetTest(keyId, function (res) {
                        if ($support.IsSuccess(res)) {
                            $scope.TestInfo = res.data.Results;
                            loadQItems();
                        } else {
                            $support.stop();
                        }
                    }, function (res) {
                        console.log(res);
                        $support.stop();
                    });
                }

                function loadQItems() {
                    $ajx.GetQItems(function (res) {
                        if ($support.IsSuccess(res)) {
                            var data = res.data.Results;
                            $scope.SubjectsList = $support.GetItems(data, 'Type', 'S');
                            $scope.SectionsList = $support.GetItems(data, 'Type', 'C');
                            GetCodingLanguages();
                        } else {
                            $support.stop();
                        }
                    }, function (res) {
                        console.log(res);
                        $support.stop();
                    });
                }

                function GetCodingLanguages() {
                    $scope.LanguagesPack = [];
                    $ajx.GeLanguages('js/data/languages.json',
                        function (res) {
                            $root.safeApply(function () {
                                $scope.LanguagesPack = res.data;
                            });
                            loadAddedQuestions();
                        }, function (err) {
                            //ConnectionError(msg_error_language_pack);
                            $support.stop();
                        });
                }

                function loadAddedQuestions() {
                    $scope.QuestionsBk = [];
                    $scope.Questions = [];
                    $ajx.GetQHeaders(queryId,
                        function (res) {
                            ChangeLayout();
                            var data = res.data.Results;
                            if ($support.IsSuccess(res)) {
                                AddToQuestionsQ(data, true);
                            }
                            $support.stop();
                        }, function (err) {
                            console.log(err);
                            $support.stop();
                        });
                }

                function AddToQuestionsQ(data, isArr) {

                    if (!$support.IsNull(data)) {
                        if ($support.IsArrayEmpty($scope.QuestionsBk)) {
                            $scope.QuestionsBk = [];
                        } else if ($scope.QuestionsBk.length === 1 && $support.IsNull($scope.QuestionsBk[0]["TestId"])) {
                            $scope.QuestionsBk = [];
                        }

                        if (isArr) {
                            angular.forEach(data, function (item) {
                                $scope.QuestionsBk.push(item);
                            });
                        } else {
                            $scope.QuestionsBk.push(data);
                        }

                    }

                    $scope.Questions = $scope.QuestionsBk;
                    $scope.TotalMarks = 0;
                    $scope.TotalTime = 0;
                    $scope.TotalQuestions = 0;
                    $scope.DeleteEnabled = 0;

                    if ($scope.Questions && $scope.Questions.length > 0) {
                        $scope.TotalMarks = parseInt($support.SumOfValues($scope.Questions, 'Marks'));
                        $scope.TotalTime = parseInt($support.SumOfValues($scope.Questions, 'Time'));
                        $scope.TotalQuestions = $scope.Questions.length;
                    }

                    $support.Hide('dvTestQListBlock');
                    $support.Hide('dvTestQNoListContentBlock');

                    if ($scope.TotalQuestions > 0) {
                        $support.Show('dvTestQListBlock');
                    } else {
                        $support.Show('dvTestQNoListContentBlock');
                    }

                }

                function ChangeLayout() {
                    $support.Hide('dvDisplayTestNoContentBlock');
                    $support.Hide('dvTestTitleBlock');
                    $support.Show('dvDisplayTestBlock');
                    $support.Show('dvCategoryBlock');
                    $support.Show('dvTestQParentBlock');
                    $support.Show('dvTestQNoListContentBlock');
                }

                $scope.OnSubjectedSelected = function () {
                    $scope.subjectId = $support.IsNull($scope.subjectId) ? 0 : $scope.subjectId;
                    $scope.SubjectName = getItemText($scope.SubjectsList, $scope.subjectId);
                    SetCategoryEnabled();
                };

                $scope.OnSectionSelected = function () {
                    $scope.sectionId = $support.IsNull($scope.sectionId) ? 0 : $scope.sectionId;
                    $scope.SectionName = getItemText($scope.SectionsList, $scope.sectionId),
                        SetCategoryEnabled();
                };

                $scope.OnOptionSelected = function () {
                    angular.forEach($scope.SingleChoice.Answers, function (itm) {
                        itm.Selected = $support.getElement('singleChecked_' + itm.ItemIndex)[0].checked;
                        itm.Checked = itm.Selected ? 'checked' : '';
                    });
                };

                function SetCategoryEnabled() {
                    $scope.CategoryDisabled = !(parseFloat($scope.subjectId) > 0 && parseFloat($scope.sectionId));
                }

                $scope.OnCategorySelected = function () {
                    defaultChoiceList();
                    for (var i = 1; i < 5; i++) {
                        var errElm = getCategoryErrorId(i);
                        $support.Hide(errElm);
                    }

                    var blockId = GetCategoryBlocks();
                    if (!$support.IsNull(blockId)) {
                        $support.Show(blockId);
                    }
                };

                function getCategoryErrorId(_itemId) {
                    var elmId = null;
                    var catId = _itemId;
                    if ($support.IsNull(catId)) catId = $scope.categoryId;
                    switch (catId) {
                        case 1: elmId = 'MultiCategoryError'; break;
                        case 2: elmId = 'SingleCategoryError'; break;
                        case 3: elmId = 'TextCategoryError'; break;
                        case 4: elmId = 'ParaCategoryError'; break;
                        case 5: elmId = 'CodeCategoryError'; break;
                    }
                    return elmId;
                }

                function GetCategoryBlocks() {

                    var blockId = '';

                    $support.Hide('dvMultiChoiceBlock');
                    $support.Hide('dvSingleChoiceBlock');
                    $support.Hide('dvTextBoxBlock');
                    $support.Hide('dvParagraphBlock');
                    $support.Hide('dvCodeTestBlock');
                    switch ($scope.categoryId) {
                        case 0: blockId = ''; break;
                        case 1: blockId = 'dvMultiChoiceBlock'; AddBlankChoices($scope.MultiChoice.Answers); break;
                        case 2: blockId = 'dvSingleChoiceBlock'; AddBlankChoices($scope.SingleChoice.Answers); break;
                        case 3: blockId = 'dvTextBoxBlock'; break;
                        case 4: blockId = 'dvParagraphBlock'; break;
                        case 5: blockId = 'dvCodeTestBlock'; break;
                    }

                    return blockId;
                }

                function AddBlankChoices(arrObj) {
                    var eItems = arrObj;
                    for (var i = eItems.length; i < 2; i++) {
                        eItems.push({
                            AnswerId: 0, ItemIndex: 0, Selected: false, Answer: '',
                            DeleteCheck: false, Deleted: false, RecordStatus: 0
                        });
                    }

                    return UpdateChoiceIndexes(eItems);
                }

                function UpdateChoiceIndexes(arrObj) {
                    var eItems = arrObj;
                    if (eItems && eItems) {
                        var iIndex = 0;
                        angular.forEach(eItems, function (item) {
                            iIndex++;
                            item.ItemIndex = iIndex;
                            item.DeleteCheck = true;
                        });
                    }

                    return eItems;
                }

                $scope.AddNewChoice = function () {

                    var eArry = null;
                    switch ($scope.categoryId) {
                        case 1: eArry = $scope.MultiChoice.Answers; break;
                        case 2: eArry = $scope.SingleChoice.Answers; break;
                    }
                    eArry.push({
                        AnswerId: 0, ItemIndex: 0, Selected: false, Answer: '',
                        DeleteCheck: false, Deleted: false, RecordStatus: 0
                    });
                    eArry = UpdateChoiceIndexes(eArry);
                    var _AllowAdd = CheckAddChoiceStatus(eArry, 'Deleted', false) < 6;
                    switch ($scope.categoryId) {
                        case 1:
                            $scope.MultiChoice.Answers = eArry;
                            $scope.AllowAddNewMultiple = _AllowAdd;
                            break;
                        case 2:
                            $scope.SingleChoice.Answers = eArry;
                            $scope.AllowAddNewSingle = _AllowAdd;
                            break;
                    }
                };

                $scope.DeleteChoiceDeItem = function (id) {
                    var eArry = null;
                    switch ($scope.categoryId) {
                        case 1: eArry = $scope.MultiChoice.Answers; break;
                        case 2: eArry = $scope.SingleChoice.Answers; break;
                    }

                    var count = CheckAddChoiceStatus(eArry, 'Deleted', false);
                    if (count === 2) return;
                    var _indx = $support.GetItemIndex(eArry, 'ItemIndex', id);
                    eArry[_indx].Deleted = true;

                    var _AllowAdd = CheckAddChoiceStatus(eArry, 'Deleted', false) < 6;
                    switch ($scope.categoryId) {
                        case 1:
                            $scope.MultiChoice.Answers = eArry;
                            $scope.AllowAddNewMultiple = _AllowAdd;
                            break;
                        case 2:
                            $scope.SingleChoice.Answers = eArry;
                            $scope.AllowAddNewSingle = _AllowAdd;
                            break;
                    }
                };

                $scope.AddQuestion = function () {

                    var errElm = getCategoryErrorId();
                    $support.Hide(errElm);
                    if ($scope.subjectId === 0 || $scope.sectionId === 0 ||
                        $scope.categoryId === 0 || $scope.complexityId === 0) {
                        $support.Show(errElm);
                        return;
                    }

                    var choiceItem = getQuestionToAdd();

                    if ($support.IsNull(choiceItem.Question)) {
                        $support.Show(errElm);
                        return;
                    } else if (parseInt(choiceItem.Marks) === 0) {
                        $support.Show(errElm);
                        return;
                    } else if (parseInt(choiceItem.Time) === 0) {
                        $support.Show(errElm);
                        return;
                    }

                    if ($scope.categoryId === 1 || $scope.categoryId === 2) {
                        if ($support.IsArrayEmpty(choiceItem.Answers)) {
                            $support.Show(errElm);
                            return;
                        } else if ($support.IsValueEmptyInArray(choiceItem.Answers, 'Answer')) {
                            $support.Show(errElm);
                            return;
                        } else if ($support.GetItemsCount(choiceItem.Answers, 'Selected', true) === 0) {
                            $support.Show(errElm);
                            return;
                        }
                    } else if ($scope.categoryId === 5) {
                        if ($support.IsNull(choiceItem.Challenge)) {
                            $support.Show(errElm);
                            return;
                        } else if ($support.IsNull(choiceItem.LanguageName)) {
                            $support.Show(errElm);
                            return;
                        }
                    }

                    $support.start();
                    $ajx.AddQHeader(choiceItem, function (res) {
                        $support.stop();
                        var data = res.data.Results;
                        if ($support.IsFailed(res)) {
                            AddErrorMessage(errElm, res.data.statusText, true);
                        } else if ($support.IsSuccess(res)) {
                            if (parseFloat(data) > 0) {
                                choiceItem.TestQId = data;
                                AddToQuestionsQ(choiceItem, false);
                                $scope.CancelQuestion();
                            } else {
                                AddErrorMessage(errElm, res.data.statusText, true);
                            }
                        }
                    }, function (err) {
                        AddErrorMessage(errElm, err.data.statusText, true);
                        $support.stop();
                    });
                };

                $scope.CancelQuestion = function () {
                    defaultChoiceList();
                    $scope.categoryId = 0;
                    $scope.subjectId = 0;
                    $scope.sectionId = 0;
                    $scope.SubjectName = '';
                    $scope.SectionName = '';
                    $scope.CategoryDisabled = true;
                    GetCategoryBlocks();
                };

                $scope.OnQuestionsChecked = function () {
                    $scope.DeleteEnabled = 0;
                    if ($scope.Questions) {
                        $scope.DeleteEnabled = $support.GetItemsCount($scope.Questions, 'Selected', true);
                    }
                };

                $scope.ShowOneBlock = function (tag, eTag) {
                    var items = tag === 'QB' ? $scope.QuestionsBank : $scope.Questions;
                    var indx = 0;
                    angular.forEach(items, function (item) {
                        if (tag + 'Block_' + indx !== eTag) {
                            $support.Hide(tag + 'Block_' + indx);
                            $support.SetValue(tag + 'Btn_' + tag + 'Block_' + indx, '+');
                        }
                        indx++;
                    });

                    var _val = $support.GetValue(tag + 'Btn_' + eTag);
                    if (_val === '+') {
                        $support.SetValue(tag + 'Btn_' + eTag, '-');
                        $support.Show(eTag);
                    } else {
                        $support.Hide(eTag);
                        $support.SetValue(tag + 'Btn_' + eTag, '+');
                    }
                };

                $scope.DeleteSelectedQ = function () {
                    var items = $support.GetItems($scope.Questions, 'Selected', true);
                    var arrItem = $support.GetArrayValues(items, 'TestQId');
                    if (!$support.IsArrayEmpty(arrItem)) {
                        $support.start();
                        $ajx.DeleteQHeaders(arrItem, function (res) {
                            if ($support.IsSuccess(res)) {
                                angular.forEach(arrItem, function (keyId) {
                                    $scope.QuestionsBk = $support.SetSelectedItem($scope.QuestionsBk, 'TestQId', keyId, 'Deleted', true);
                                    $scope.QuestionsBk = $support.SetSelectedItem($scope.QuestionsBk, 'TestQId', keyId, 'Selected', false);
                                });
                            }
                            $scope.QuestionsBk = $support.ExcludeItem($scope.QuestionsBk, 'Deleted', true);
                            AddToQuestionsQ('', false);
                            $support.stop();
                        }, function (err) {
                            console.log(err);
                            $support.stop();
                        });
                    }
                };

                /* Preview Added Questions Start */
                var curIndx = 0;
                $scope.QuestionItem = {};
                $scope.OnShowPreviewTest = function () {
                    $scope.QuestionItem = {};
                    curIndx = 0;
                    UpdateNavigation();
                    $support.Show('popPreviewTest');
                };

                $scope.MoveNext = function () {
                    curIndx++;
                    UpdateNavigation();
                };

                $scope.MovePrev = function () {
                    curIndx--;
                    UpdateNavigation();
                };

                function UpdateNavigation() {
                    if (curIndx === 0) {
                        $scope.Previous = false;
                        $scope.Next = false;
                        if ($scope.TotalQuestions > 1) $scope.Next = true;
                    } else {
                        $scope.Previous = true;
                        $scope.Next = true;
                        if (curIndx === $scope.TotalQuestions - 1) {
                            $scope.Previous = true;
                            $scope.Next = false;
                        }
                    }

                    if ($scope.Questions) {
                        $scope.QuestionItem = $scope.Questions[curIndx];
                        $scope.QuestionItem.QIndex = curIndx + 1;
                    }
                }

                /* Preview Added Questions End */

                /* Filter On Added Questions Start */
                $scope.filterSubjectId = 0;
                $scope.filterSectionId = 0;
                $scope.filterCategoryId = 0;
                $scope.filterComplexityId = 0;
                $scope.FilterControlItems = [];

                $scope.OnFilterSelected = function () {
                    $scope.filterSubjectId = $support.IsNull($scope.filterSubjectId) ? 0 : $scope.filterSubjectId;
                    $scope.filterSectionId = $support.IsNull($scope.filterSectionId) ? 0 : $scope.filterSectionId;
                    $scope.filterCategoryId = $support.IsNull($scope.filterCategoryId) ? 0 : $scope.filterCategoryId;
                    $scope.filterComplexityId = $support.IsNull($scope.filterComplexityId) ? 0 : $scope.filterComplexityId;
                    UpdateFilterControl();
                };

                $scope.RemoveSelectedFilter = function (filterId) {
                    if (filterId === 1) $scope.filterSubjectId = 0;
                    if (filterId === 2) $scope.filterSectionId = 0;
                    if (filterId === 3) $scope.filterCategoryId = 0;
                    if (filterId === 4) $scope.filterComplexityId = 0;
                    $scope.FilterControlItems = $support.ExcludeItem($scope.FilterControlItems, 'Id', filterId);
                    UpdateFilterControl();
                };

                $scope.ClearAllFilter = function () {
                    $scope.filterSubjectId = 0;
                    $scope.filterSectionId = 0;
                    $scope.filterCategoryId = 0;
                    $scope.filterComplexityId = 0;
                    UpdateFilterControl();
                };

                function UpdateFilterControl() {
                    $scope.FilterControlItems = [];
                    $scope.Questions = $scope.QuestionsBk;
                    if ($scope.filterSubjectId > 0) {
                        $scope.FilterControlItems.push({
                            Id: 1,
                            Name: 'Subject',
                            Title: getItemText($scope.SubjectsList, $scope.filterSubjectId),
                            Value: $scope.filterSubjectId
                        });

                        $scope.Questions = $support.GetItems($scope.Questions, 'SubjectId', $scope.filterSubjectId);
                    }

                    if ($scope.filterSectionId > 0) {
                        $scope.FilterControlItems.push({
                            Id: 2,
                            Name: 'Section',
                            Title: getItemText($scope.SectionsList, $scope.filterSectionId),
                            Value: $scope.filterSectionId
                        });
                        $scope.Questions = $support.GetItems($scope.Questions, 'SectionId', $scope.filterSectionId);
                    }

                    if ($scope.filterCategoryId > 0) {
                        $scope.FilterControlItems.push({
                            Id: 3,
                            Name: 'Category',
                            Title: getItemName($scope.CategoryList2, $scope.filterCategoryId),
                            Value: $scope.filterCategoryId
                        });
                        $scope.Questions = $support.GetItems($scope.Questions, 'CategoryId', $scope.filterCategoryId);
                    }

                    if ($scope.filterComplexityId > 0) {
                        $scope.FilterControlItems.push({
                            Id: 4,
                            Name: 'Complexity',
                            Title: $scope.filterComplexityId,
                            Value: $scope.filterComplexityId
                        });
                        $scope.Questions = $support.GetItems($scope.Questions, 'Complexity', $scope.filterComplexityId);
                    }

                }

                /* Filter On Added Questions End */

                /* Filter On Added Questions Bank Start */
                $scope.filterQSubjectId = 0;
                $scope.filterQSectionId = 0;
                $scope.filterQCategoryId = 0;
                $scope.filterQComplexityId = 0;
                $scope.FilterQControlItems = [];

                $scope.OnQBFilterSelected = function () {
                    $scope.filterQSubjectId = $support.IsNull($scope.filterQSubjectId) ? 0 : $scope.filterQSubjectId;
                    $scope.filterQSectionId = $support.IsNull($scope.filterQSectionId) ? 0 : $scope.filterQSectionId;
                    $scope.filterQCategoryId = $support.IsNull($scope.filterQCategoryId) ? 0 : $scope.filterQCategoryId;
                    $scope.filterQComplexityId = $support.IsNull($scope.filterQComplexityId) ? 0 : $scope.filterQComplexityId;
                    UpdateQFilterControl();
                };

                $scope.RemoveSelectedQFilter = function (filterId) {
                    if (filterId === 1) $scope.filterQSubjectId = 0;
                    if (filterId === 2) $scope.filterQSectionId = 0;
                    if (filterId === 3) $scope.filterQCategoryId = 0;
                    if (filterId === 4) $scope.filterQComplexityId = 0;
                    $scope.FilterQControlItems = $support.ExcludeItem($scope.FilterQControlItems, 'Id', filterId);
                    UpdateQFilterControl();
                };

                $scope.ClearAllQFilter = function () {
                    $scope.filterQSubjectId = 0;
                    $scope.filterQSectionId = 0;
                    $scope.filterQCategoryId = 0;
                    $scope.filterQComplexityId = 0;
                    UpdateQFilterControl();
                };

                function UpdateQFilterControl() {
                    $scope.FilterQControlItems = [];
                    $scope.QuestionsBank = $scope.QuestionsBankBk;
                    if ($scope.filterQSubjectId > 0) {
                        $scope.FilterQControlItems.push({
                            Id: 1,
                            Name: 'Subject',
                            Title: getItemText($scope.SubjectsList, $scope.filterQSubjectId),
                            Value: $scope.filterQSubjectId
                        });

                        $scope.QuestionsBank = $support.GetItems($scope.QuestionsBank, 'SubjectId', $scope.filterQSubjectId);
                    }

                    if ($scope.filterQSectionId > 0) {
                        $scope.FilterQControlItems.push({
                            Id: 2,
                            Name: 'Section',
                            Title: getItemText($scope.SectionsList, $scope.filterQSectionId),
                            Value: $scope.filterQSectionId
                        });
                        $scope.QuestionsBank = $support.GetItems($scope.QuestionsBank, 'SectionId', $scope.filterQSectionId);
                    }

                    if ($scope.filterQCategoryId > 0) {
                        $scope.FilterQControlItems.push({
                            Id: 3,
                            Name: 'Category',
                            Title: getItemName($scope.CategoryList2, $scope.filterQCategoryId),
                            Value: $scope.filterQCategoryId
                        });
                        $scope.QuestionsBank = $support.GetItems($scope.QuestionsBank, 'CategoryId', $scope.filterQCategoryId);
                    }

                    if ($scope.filterQComplexityId > 0) {
                        $scope.FilterQControlItems.push({
                            Id: 4,
                            Name: 'Complexity',
                            Title: $scope.filterQComplexityId,
                            Value: $scope.filterQComplexityId
                        });
                        $scope.QuestionsBank = $support.GetItems($scope.QuestionsBank, 'Complexity', $scope.filterQComplexityId);
                    }

                }

                /* Filter On Added Questions Bank End */

                /* Show Question Bank Start */
                $scope.QuestionsBankBk = [];
                $scope.QuestionsBank = [];

                $scope.OnShowAddFromQBank = function () {
                    $scope.QuestionsBankBk = [];
                    $scope.QuestionsBank = [];
                    $scope.TotalBQuestions = 0;

                    $support.start();
                    $ajx.GetQBankHeaders(queryId,
                        function (res) {
                            $support.stop();
                            if ($support.IsSuccess(res)) {
                                $scope.QuestionsBankBk = res.data.Results;
                            }
                            $scope.QuestionsBank = $scope.QuestionsBankBk;
                            $support.Show('popAddQfromBank');
                        },
                        function (err) {
                            $support.stop();
                            $scope.QuestionsBank = $scope.QuestionsBankBk;
                            $support.Show('popAddQfromBank');
                        }
                    );
                };

                $scope.OnHideAddFromQBank = function () {
                    $support.Hide('popAddQfromBank');
                };

                $scope.TotalBQuestions = 0;
                $scope.OnAddFromQBankChecked = function () {
                    $scope.TotalBQuestions = $support.GetItemsCount($scope.QuestionsBank, 'Selected', true);
                };

                $scope.OnAddFromQBank = function () {
                    var QBankSelected = $support.GetItems($scope.QuestionsBank, 'Selected', true);
                    var ItemsSelected = [];
                    angular.forEach(QBankSelected, function (item) {
                        var rtnObj = AddToQuestions(item);
                        rtnObj.QBankId = item.QBankId;
                        ItemsSelected.push(rtnObj);
                    });

                    if ($support.IsArrayEmpty(ItemsSelected)) return;

                    $support.start();
                    $ajx.AddQHeaders(ItemsSelected, function (res) {
                        $support.stop();
                        $scope.OnHideAddFromQBank();
                        if ($support.IsSuccess(res)) {
                            loadAddedQuestions();
                        }

                    }, function (err) {
                        //AddErrorMessage(errElm, err.data.statusText, true);
                        $support.stop();
                    });
                };

                function AddToQuestions(bankItem) {
                    var _question = {
                        TestQId: 0,
                        TestId: queryId,
                        Selected: false,
                        Marks: bankItem.Marks,
                        Time: bankItem.Time,
                        AllowMultiples: !$support.IsNull(bankItem['AllowMultiples']) ? bankItem.AllowMultiples : false,
                        SaveToBank: false,
                        Mandatory: !$support.IsNull(bankItem['Mandatory']) ? bankItem.Mandatory : false,
                        LanguageId: !$support.IsNull(bankItem['LanguageId']) ? bankItem.LanguageId : 0,
                        LanguageName: !$support.IsNull(bankItem['LanguageId']) ? bankItem.LanguageName : '',
                        Answers: !$support.IsNull(bankItem['Answers']) ? bankItem.Answers : [],
                        SubjectId: bankItem.SubjectId,
                        SubjectName: bankItem.SubjectName,
                        SectionId: bankItem.SectionId,
                        SectionName: bankItem.SectionName,
                        CategoryId: bankItem.CategoryId,
                        CategoryName: bankItem.CategoryName,
                        Complexity: bankItem.Complexity,
                        Question: bankItem.Question,
                        Challenge: !$support.IsNull(bankItem['Challenge']) ? bankItem.Challenge : ''
                    };
                    return _question;
                }
                /* Show Question Bank End */

                /* Show Random Questions from QBank Starts */
                $scope.RQuestionsBankBk = [];
                $scope.RQuestionsBank = [];

                $scope.OnShowRandomFromQBank = function () {
                    $support.Show('popRandomPick');
                };

                $scope.OnHideRandomFromQBank = function () {
                    $support.Hide('popRandomPick');
                };
                /* Show Random Questions from QBank Ends */


                /* Publish the test */
                $scope.OnPublishClicked = function () {
                    $support.start();
                    var data = {
                        Id: queryId,
                        Text: "1"
                    };
                    $ajx.PublishTest(data, function (res) {
                        $support.stop();
                        $support.Show('popJobPublishSuccessful');
                    }, function (err) {
                        $support.stop();
                    });
                };
                /* Show Random Questions from QBank Ends */

                $scope.sectTagType = '';
                $scope.sectTagVal = '';
                $scope.ShowAddSection = function (keyId) {
                    $support.Hide('secterror');
                    $scope.sectTagVal = '';
                    $scope.sectTagType = keyId;
                    if (keyId === 'S') {
                        $support.SetText('sectTagName', 'Subject Name');
                    } else if (keyId === 'C') {
                        $support.SetText('sectTagName', 'Section Name');
                    }
                    $support.Show('popAddSection');
                };

                $scope.AddSection = function () {
                    $support.Hide('secterror');
                    if ($support.IsNull($scope.sectTagVal)) {
                        $support.Show('secterror');
                    } else {
                        var data = {
                            Text: $scope.sectTagVal,
                            Type: $scope.sectTagType
                        };
                        $support.start();
                        $ajx.AddQItem(data, function (res) {
                            $support.stop();
                            var data = res.data.statusText;
                            if ($support.IsFailed(res)) {
                                if (data === 'EXIST') {
                                    AddErrorMessage('secterror', 'Item alreay exist...!', true);
                                }
                            } else if ($support.IsSuccess(res)) {
                                var id = res.data.Results['Id'];
                                if (id && id > 0) {
                                    if ($scope.sectTagType === 'C') {
                                        $scope.SectionsList.push(res.data.Results);
                                    } else if ($scope.sectTagType === 'S') {
                                        $scope.SubjectsList.push(res.data.Results);
                                    }
                                    $support.Hide('popAddSection');
                                } else {
                                    AddErrorMessage('secterror', 'System fail to process. Please try again.', true);
                                }
                            } else {
                                AddErrorMessage('secterror', data, true);
                            }
                        }, function (res) {
                            $support.stop();
                            AddErrorMessage('secterror', 'System fail to process. Please try again.', true);
                        });

                    }
                };

                function getQuestionToAdd() {

                    var choiceItem = null;
                    switch ($scope.categoryId) {
                        case 1: choiceItem = $scope.MultiChoice; break;
                        case 2: choiceItem = $scope.SingleChoice; break;
                        case 3: choiceItem = $scope.TextBoxChoice; break;
                        case 4: choiceItem = $scope.ParaChoice; break;
                        case 5: choiceItem = $scope.CodeChoice; break;
                    }

                    if ($support.IsNull(choiceItem)) return null;

                    var _question = {
                        TestQId: 0,
                        TestId: queryId,
                        Selected: false,
                        Marks: choiceItem.Marks,
                        Time: choiceItem.Time,
                        AllowMultiples: !$support.IsNull(choiceItem['AllowMultiples']) ? choiceItem.AllowMultiples : false,
                        SaveToBank: !$support.IsNull(choiceItem['SaveToBank']) ? choiceItem.SaveToBank : false,
                        Mandatory: !$support.IsNull(choiceItem['Mandatory']) ? choiceItem.Mandatory : false,
                        LanguageId: !$support.IsNull(choiceItem['LanguageId']) ? choiceItem.LanguageId : 0,
                        LanguageName: !$support.IsNull(choiceItem['LanguageId']) ? getItemName($scope.LanguagesPack, choiceItem.LanguageId) : '',
                        Answers: !$support.IsNull(choiceItem['Answers']) ? choiceItem.Answers : [],
                        SubjectId: $scope.subjectId,
                        SubjectName: getItemText($scope.SubjectsList, $scope.subjectId),
                        SectionId: $scope.sectionId,
                        SectionName: getItemText($scope.SectionsList, $scope.sectionId),
                        CategoryId: $scope.categoryId,
                        CategoryName: getItemName($scope.CategoryList, $scope.categoryId),
                        Complexity: $scope.complexityId,
                        Question: choiceItem.Question,
                        Challenge: !$support.IsNull(choiceItem['Challenge']) ? choiceItem.Challenge : ''
                    };
                    return _question;
                }

                function AddErrorMessage(refId, msg, display) {
                    $support.Hide(refId);
                    $support.SetText(refId, msg);
                    if (display) {
                        $support.Show(refId);
                    }
                }

                function getItemText(obj, id) {
                    var _indx = $support.GetItem(obj, 'Id', id);
                    if (_indx) return _indx.Text;
                    return '';
                }
                function getItemName(obj, id) {
                    var _indx = $support.GetItem(obj, 'Id', id);
                    if (_indx) return _indx.Name;
                    return '';
                }

                function CheckAddChoiceStatus(obj, keyId, keyVal) {
                    return $support.GetItemsCount(obj, keyId, keyVal);
                }

            }]);
});