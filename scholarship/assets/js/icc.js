$(document).ready(function() {

    var MAX_LOANS = 4;
    var $form = $("form#user-info");

    // set the click for the "add a loan" button
    var $loans = $form.find("#loans");
    $form.find("#loan-add").click(function(e) {

        e.preventDefault();
        e.stopPropagation();

        var $addBtn = $(this);

        var num = $loans.find(".inner-block").length + 1;

        var $loanBlock = $("<div></div>", {
            class: "inner-block"
        }).appendTo($loans);

        var $label = $("<label></label>", {
            text: "Loan #" + num,
            for: "loan" + num
        }).appendTo($loanBlock);

        var $loanWrap = $("<div></div>", {id:"loan" + num, class: "loan"}).appendTo($loanBlock);

        // input for amount
        var $amount = $("<input>", {
            placeholder: "Amount",
            id: "loan" + num + "-amt",
            class: "form-control"
        }).appendTo($loanWrap);

        // input for interest rate
        var $rate = $("<input>", {
            placeholder: "Interest Rate",
            id: "loan" + num + "-rate",
            class: "form-control"
        }).appendTo($loanWrap);

        // button
        var $removeBtn = $("<button></button>", {
            type: "button",
            class: "btn btn-danger btn-xs loan-remove",
            html: "<span class='glyphicon glyphicon-remove'></span> Remove"
        }).click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            $.when(
                $loanBlock.slideUp()
            ).done(function() {
                $loanBlock.remove();
                if ($loans.find(".inner-block").length === 0)
                    $loans.hide();
                if ($loans.find(".inner-block").length < MAX_LOANS && $addBtn.is(".disabled"))
                    $addBtn.removeClass("disabled");
                reindex();
                calculate();
            });
        }).appendTo($loanWrap);
        
        $.when(
            $loans.show(),
            $loanBlock.slideDown()
        ).done(function() {
            $amount.focus();
        });

        if ($loans.find(".inner-block").length === MAX_LOANS)
            $addBtn.addClass("disabled");
    });

    function dollarFormat(nStr) {
        nStr += '';
        var x = nStr.split('.');
        var x1 = x[0];
        var x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        var prefix = "$";
        if (x1.indexOf("-") === 0) {
            x1 = x1.replace("-", "");
            prefix = "-" + prefix;
        }

        return prefix + x1 + x2;
    };

    function reindex() {
        var $loanBlocks = $loans.find(".inner-block");
        $loanBlocks.each(function(i) {
            var $loan = $(this);
            var newIdx = "loan" + (i + 1);
            $loan.find("label").attr("for", newIdx).text("Loan #" + (i+1));
            $loan.find(".loan").attr("id", newIdx);
            $loan.find("input").each(function() {
                var id = this.id;
                id = id.split("-");
                id[0] = newIdx;
                id = id.join("-");
                this.id = id;
            });
        });
    };

    function validate() {
        var noErrors = true;
        $form.find("input").each(function() {
            if ($(this).val() && !$.isNumeric($(this).val())) {
                noErrors = false;
                $(this).parent().addClass("has-error");
            }
            else {
                $(this).parent().removeClass("has-error");
            }
        });
        return noErrors;
    };

    // Results
    var $income = $("#est-income"),
        $dfn = $("#est-dfn"),
        $scholarship = $("#est-scholarship"),
        $payout = $("#est-payout");

    function calculate() {
        if (validate()) {

            // Gather all our values for the calculations
            var pay = $form.find("#pay").val()
            if (isNaN(pay)) pay = 0;

            var hours = parseFloat($form.find("#hours").val());
            if (isNaN(hours)) hours = 0;

            var contract = parseFloat($form.find("#contract-length").val());
            if (isNaN(contract)) contract = 0;
            
            var grants = parseFloat($form.find("#grants").val());
            if (isNaN(grants)) grants = 0;

            var parents = parseFloat($form.find("#parents").val());
            if (isNaN(parents)) parents = 0;

            var otherIncome = parseFloat($form.find("#other-income").val());
            if (isNaN(otherIncome)) otherIncome = 0;

            var charges = parseFloat($form.find("#charges").val());
            if (isNaN(charges)) charges = 0;

            var tuition = parseFloat($form.find("#tuition").val());
            if (isNaN(tuition)) tuition = 0;

            var otherExpenses = parseFloat($form.find("#other-expenses").val());
            if (isNaN(otherExpenses)) otherExpenses = 0;

            // Calcuate estimated monthly income
            var adjIncome =  (pay - 9) * hours * 4 * contract;
            if (adjIncome < 0) adjIncome = 0;

            // Calculate estimated DFN
            var loans = 0;
            $form.find(".loan").each(function() {
                var amt = parseFloat($(this).find("input[id$='-amt']").val()) || 0;
                var rate = parseFloat($(this).find("input[id$='-rate']").val()) || 0;
                loans += amt * (1 - rate);
            });
            var dfn = (contract * charges) + (tuition * .25 * contract) + otherExpenses - (grants + loans + parents + otherIncome + adjIncome);

            // Calculate monthly payout
            var monthlyPayout = 0;
            if (dfn > -1000 && dfn < 1000.001)
                monthlyPayout = 50;
            if (dfn > 1000 && dfn < 3000.001)
                monthlyPayout = 125;
            if (dfn > 3000 && dfn < 5000.001)
                monthlyPayout = 200;
            if (dfn > 5000)
                monthlyPayout = 300;

            // Calculate estimated scholarship
            var scholarship = ( (monthlyPayout * contract) > 0 ? monthlyPayout * contract : false );

            // Animate the changes to the results
            adjIncome = dollarFormat(adjIncome.toFixed(2));
            dfn = dollarFormat(dfn.toFixed(2));
            monthlyPayout = dollarFormat(monthlyPayout.toFixed(2));

            $income.html(adjIncome);
            $dfn.html(dfn);
            $payout.html(monthlyPayout);

            if (scholarship !== false)
                $scholarship.html(dollarFormat(scholarship.toFixed(2)));
            else
                $scholarship.html("<span class='danger'>Not eligible</span>");
        }
    };

    $("form#user-info").on("blur", "input", calculate);
});
