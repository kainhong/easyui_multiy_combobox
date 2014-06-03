$.fn.extend({
    selectionStart: function (value) {
        var elem = this[0];
        if (elem && (elem.tagName == "TEXTAREA" || elem.type == "text")) {
            if (value === undefined) {
                return elem.selectionStart;
            } else if (typeof value === "number") {
                elem.selectionEnd = value;
                elem.selectionStart = value;
            }
        } else {
            if (value === undefined)
                return undefined;
        }
    }
})

$.extend($.fn.datagrid.methods, {
    editCell: function (jq, param) {
        return jq.each(function () {
            var opts = $(this).datagrid('options');
            var fields = $(this).datagrid('getColumnFields', true).concat($(this).datagrid('getColumnFields'));
            for (var i = 0; i < fields.length; i++) {
                var col = $(this).datagrid('getColumnOption', fields[i]);
                col.editor1 = col.editor;
            }
            $(this).datagrid('beginEdit', param.index);
            for (var i = 0; i < fields.length; i++) {
                var col = $(this).datagrid('getColumnOption', fields[i]);
                col.editor = col.editor1;
            }
        });
    }
});

$(function ($) {

    $.each($.fn.datagrid.defaults.editors, function (type, editor) {
        (function (editor) {
            var initFun = editor.init;
            editor.init = function (container, options) {
                var target = initFun(container, options);

                var editor = target;
                if (type == 'combobox') {
                    editor = target.combobox('textbox')
                }
                $(editor).bind('keydown', function (event) {
                    handleKeydown($(target), event);
                });
                return target;
            }
        })(editor);
    });

    function handleKeydown(target, event) {
        var key = event.keyCode;
        if (key == 9 || key == 13) {
            event.preventDefault();
            event.stopPropagation();
        }
        if (event.shiftKey)
            key = "shift+" + key;
        var fun = keyHandle[key];
        console.log(event);
        if (typeof fun == "function") {
            fun.apply(this, target);
        }
    };

    function moveLeftDirect(target) {
        moveHorizontal(target, -1,true);
    }
    function moveRightDirect(target) {
        moveHorizontal(target, 1,true);
    }

    function moveLeft(target) {
        moveHorizontal(target, -1);
    }

    function moveUp(target) {
        moveVertical(target, true);
    }

    function moveDown(target) {
        moveVertical(target, false);
    }

    function moveRight(target) {
        moveHorizontal(target, 1);
    }

    function moveVertical(target, isUp) {
        var cell = getCellInfo(target);
        var index = cell.index;
        moveToOtherRow(cell,isUp,cell.index);
    }

    function moveHorizontal(target, step,direct) {
        var cell = getCellInfo(target);
        var grid = cell.grid;
        if (!grid.datagrid('validateRow'))
            return;

        if (!direct) {
            var selectionStart = $(target).selectionStart();
            if (selectionStart != undefined && selectionStart != 0 && step < 0)
                return;
            if (step > 0) {
                var txt = $(target).val();
                if (txt && txt.length > selectionStart)
                    return;
            }
        }

        var fields = cell.fields;// grid.datagrid('getColumnFields', true).concat($('#dg').datagrid('getColumnFields'));
        var index = cell.index;

        if (index < 0)
            index = step < 0 ? 0 : fields.length - 1;
        else
            index = index + step;


        if (index >= 0 && index < fields.length) {
            focusCell(target, cell, index, step < 0);
        }
        else if (index < 0) {
            moveToOtherRow(cell, true);
        }
        else if (index >= fields.length) {
            moveToOtherRow(cell, false);
        }
    }

    function focusCell(target, cell, cellNewIndex, isLeft) {
        /*
        rowedit不是原生方法，editindex如果通过api方式扩展，可以根据api来读取。
        否则使用如下方式代替，效率会有所降低。
        var row = grid.datagrid('getSelected');
        var rowIndex = grid.datagrid('getRowIndex', row);
        */
        var rowIndex = window.editIndex; 
        var ed = getCellEditor(rowIndex, cellNewIndex, cell, isLeft);//  grid.datagrid('getEditor', { index: rowIndex, field: field });
        if (ed != null && ed != "") {
            var target = ed.target;
            var editor = ed.target;
            if (ed.type == "combobox") {
                editor = target.combobox('textbox')
            }
            editor.focus();
            editor.select();
            return true;
        }
        return false;
    }

    function getCellEditor(rowIndex,cellNewIndex, cell, isLeft) {
        var step = isLeft ? -1 : 1;
        var cellIndex = cellNewIndex;
        var fields = cell.fields;
        var grid = cell.grid;
        var ed = grid.datagrid('getEditor', { index: rowIndex, field: fields[cellIndex] });
        if (ed)
            return ed;
        while (true) {
            cellIndex += step;
            if (cellIndex < 0 || cellIndex >= fields.length) {
                moveToOtherRow(cell, isLeft);
                return;
            }
            else {
                ed = grid.datagrid('getEditor', { index: rowIndex, field: fields[cellIndex] });
                if (ed)
                    return ed;
            }
        }
    }

    function moveToOtherRow(cell, isUp, cellIndex) {
        var grid = cell.grid;
        
        var row = grid.datagrid('getSelected');
        var rowIndex = grid.datagrid('getRowIndex', row);
        var rows = grid.datagrid('getRows');
        var index = rowIndex + (isUp ? -1 : 1);
        if (index < 0 || index >= rows.length)
            return;
        var fields = cell.fields;
        if (endEditing()) {
            grid.datagrid('selectRow', index)
                .datagrid('beginEdit', index);
            window.editIndex = index;
            if (cellIndex == undefined)
                cellIndex = isUp ? fields.length - 1 : 0;
            var field = fields[cellIndex];
            focusCell(index, cell,cellIndex, isUp);
        }
    }

    function getCellInfo(target, fields) {
        var cell = $(target).parent().parent().parent().parent().parent();
        var grid = findGrid($(cell));
        var data = $.data($(cell)[0], "datagrid.editor");
        var fields = grid.datagrid('getColumnFields', true).concat(grid.datagrid('getColumnFields'));
        var field = data.field;
        var index = -1;
        $.each(fields, function (i, name) {
            if (name == data.field)
                index = i;
        });

        return {
            cell: cell,
            grid: grid,
            index: index,
            field: field,
            fields:fields
        };
    }

    function findGrid(cell) {
        var parent = $(cell).parent();
        var i = 0;
        while (parent != window.document && i < 20) {
            var grid = parent.children('.easyui-datagrid');
            if (grid.length != 0)
                return grid;
            parent = parent.parent();
            i++;
        }
    }

    function getGrid(cell) {
        var gridId = $.data(cell[0], 'gridId');
        if (!gridId) {
            var grid = findGrid(container);
            gridId = grid.attr("id");
            $.data(cell[0], 'gridId', gridId);
            return grid;
        }
        return $("#" + gridId);
    }

    var keyHandle = {
        37: moveLeft,
        38: moveUp,
        40: moveDown,
        39: moveRight,
        13: moveRightDirect,
        9: moveRightDirect,
        "shift+9": moveLeftDirect
    };
});