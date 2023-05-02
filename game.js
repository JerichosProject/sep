class board {
    #_maxColumn=5;
    #_maxRow=6;
    #_countersToWin=4;
    #_countersNeededToDestroy=3;

    // the below can be dynamic
    #maxColumn=this.#_maxColumn;
    #maxRow=this.#_maxRow;
    #countersToWin=this.#_countersToWin;
    #countersNeededToDestroy=this.#_countersNeededToDestroy;
    /*
        constructor called on load;
        generates the board;
    */
    constructor() {
        this.constructBoard();
    }

    constructBoard() {
        console.log('h')
        let table=$('#game').find('tbody').eq(0);
        table.empty();
        let button=$('#player').find('.buttons').eq(0);
        button.empty();
        let out='';
        let column=0;
        let row=0;
        for(row=0;row<this.#maxRow;row++) {
            out='';
            for(column=0;column<this.#maxColumn;column++) {
                out+='<td></td>';
            }
            table.append('<tr>'+out+'</tr>');
        }
        for(column=0;column<this.#maxColumn;column++) {
            button.append('<button class="counter" column="'+column+'">Column '+(column+1)+'</button>');
        }
        $('#counters_to_win').val(this.#countersToWin);
        $('#counters_to_destroy').val(this.#countersNeededToDestroy);
        $('#grid_x').val(this.#maxColumn);
        $('#grid_y').val(this.#maxRow);

        $('.other_buttons').show();
    }

    reset() {
        this.#maxColumn=this.#_maxColumn;
        this.#maxRow=this.#_maxRow;
        this.#countersToWin=this.#_countersToWin;
        this.#countersNeededToDestroy=this.#_countersNeededToDestroy;
    }
    /*
        updatebaord called by user to update board
    */
    updateBoard() {
        let grid_x=parseInt($('#grid_x').val());
        let grid_y=parseInt($('#grid_y').val());
        let towin=parseInt($('#counters_to_win').val());
        let todestroy=parseInt($('#counters_to_destroy').val());
        if(grid_x<0||grid_x>15||typeof(grid_y)!='number') return 2;
        if(grid_y<0||grid_y>15||typeof(grid_y)!='number') return 3;
        if(towin<0||towin>15||typeof(towin)!='number') return 4;
        if(todestroy<0||todestroy>15||typeof(todestroy)!='number') return 5;

        this.#maxColumn=parseInt(grid_x);
        this.#maxRow=parseInt(grid_y);
        this.#countersToWin=parseInt(towin);
        this.#countersNeededToDestroy=parseInt(todestroy);
        console.log(this.#maxColumn)
        return true;
    }

    /*
        freespaces called at every round checking if there are free places;
        returns bool;
    */
    spacesFree() {
        let table=$('#game').find('tbody').eq(0);
        let col=null;

        for(col=0;col<this.#maxColumn;col++) {
            if(table.find('tr').eq(0).find('td').eq(col).attr('class')=='' || table.find('tr').eq(0).find('td').eq(col).attr('class')==undefined) return true;
        }
        return false;
    }
    /*
        !PRIVATE!
        validzone called when player presses a column - to place counter;
        returns bool;
    */
    #validZone(column=null) {
        if(column==null) {
            console.error('Column was null!');
            return false;
        }
        if(typeof(column)!='number') {
            console.error('Column was not a number!');
            return false;
        }
        if(column>this.#maxColumn) {
            console.error('Max column is '+this.#maxColumn+'!');
            return false;
        }
        let table=$('#game').find('tbody').eq(0);
        if(table.find('tr').eq(0).find('td').eq(column).length==0) {
            console.error('Could not find column '+column+'!');
            return false;
        }
        table=table.find('tr').eq(0).find('td').eq(column);

        // console.log(table.attr('class'));

        if(table.attr('class')=='' || table.attr('class')==undefined) return true;
        console.error('Column full!');
        return false;
    }

    /* 
        !PRIVATE!
        dropcounter called when validzone is true
    */
    #dropCounter(column=null,counter=null) {
        let table=$('#game').find('tbody').eq(0);
        let row=0;
        let tmptable=null;
        let tmprow=null;
        let force_row=null;
        
        for(row=0;row<this.#maxRow;row++) {
            tmprow=row+1;
            tmptable=table.find('tr').eq(row).find('td').eq(column);
            if(tmptable.attr('class')=='' || tmptable.attr('class')==undefined) {
                //current column free - check if next one is aswell - if so loop;
                if(tmprow<=this.#maxRow) {
                    if(table.find('tr').eq(tmprow).find('td').eq(column).attr('class')!='' && table.find('tr').eq(tmprow).find('td').eq(column).attr('class')!=undefined) {
                        force_row=tmprow - 1;
                    }
                }
            }
        }

        if(force_row==null) force_row=this.#maxRow - 1;

        table.find('tr').eq(force_row).find('td').eq(column).addClass(counter);
        // console.log(force_row);
        // console.log(column);
        // console.log(counter);
        return true;
    }

    /*
        !PRIVATE!
        move animates
    */
    move(column,ply) {
        if(!this.#validZone(column)) return false;
        this.#dropCounter(column,(ply.whos_turn()==0?'red':'yellow'));
    }

    connectFour(ply) {
        let current_ply=ply.whos_turn();
        let colour=(current_ply==0?'red':'yellow');
        let table=$('#game').find('tbody').eq(0);
        let tmptable=null;

        let row=null;
        let column=null;
        let valid_hor=0;
        let valid_vert=0;
        // let valid_diag=0;

        // console.warn(current_ply)
        // console.warn(colour)

        /* checks horizontial */
        for(row=0;row<this.#maxRow;row++) {
            valid_hor=0;
            tmptable=table.find('tr').eq(row);
            for(column=0;column<this.#maxColumn;column++) {
                // console.log(tmptable.find('td').eq(column).hasClass(colour));
                if(tmptable.find('td').eq(column).hasClass(colour)) valid_hor++;
                else valid_hor=0;

                if(valid_hor>=this.#countersToWin) return true;
            }
        }

        for(column=0;column<this.#maxColumn;column++) {
            valid_vert=0;
            // console.log('----------');
            for(row=0;row<this.#maxRow;row++) {
                tmptable=table.find('tr').eq(row).find('td').eq(column);
                // console.log('col='+(column)+' row='+row+' class='+tmptable.hasClass(colour));
                // console.log(tmptable.find('td').eq(row).hasClass(colour));
                if(tmptable.hasClass(colour)) valid_vert++;
                else valid_vert=0;

                if(valid_vert>=this.#countersToWin) return true;
            }
        }
        return false;
    }

    specialConnectFour(ply) {
        let current_ply=ply.whos_turn();
        let colour=(current_ply==0?'red':'yellow');
        let table=$('#game').find('tbody').eq(0);
        let tmptable=null;

        let row=null;
        let column=null;
        let my_counter_hor=false;
        let valid_hor=0;
        let hor_local_stores={};
        let hor_local_stores_mine={};
        let valid_vert=0;
        let my_counter_vert=false;
        let vert_local_stores={};
        let vert_local_stores_mine={};

        let re_gig_board=false;

        /* checks horizontial */
        for(row=0;row<this.#maxRow;row++) {
            valid_hor=0;
            hor_local_stores={};
            tmptable=table.find('tr').eq(row);
            my_counter_hor=false;

            for(column=0;column<this.#maxColumn;column++) {
                // console.log(tmptable.find('td').eq(column).hasClass(colour));
                if(tmptable.find('td').eq(column).hasClass(colour) && tmptable.find('td').eq(column).attr('cannot_destroy_others')==undefined) {
                    valid_hor=0;
                    hor_local_stores_mine[column]=tmptable.find('td').eq(column);
                    my_counter_hor=true;
                }else if(my_counter_hor && (tmptable.find('td').eq(column).attr('class')!='' && !tmptable.find('td').eq(column).hasClass(colour) && tmptable.find('td').eq(column).attr('cannot_destroy_others')!=undefined)) {
                    hor_local_stores[column]=tmptable.find('td').eq(column);
                    valid_hor++;
                }else valid_hor=0;

                if(valid_hor>=this.#countersNeededToDestroy) {
                    if(tmptable.find('td').eq(column + 1).hasClass(colour) && tmptable.find('td').eq(column + 1).attr('cannot_destroy_others')==undefined) {
                        hor_local_stores_mine[column]=tmptable.find('td').eq(column + 1);
                        $.each(hor_local_stores,function(k,i){
                            $(this).removeClass('red yellow');
                        });
                        $.each(hor_local_stores_mine,function(k,i){
                            $(this).attr('cannot_destroy_others','true')
                        });
                        re_gig_board=true;
                        break;
                    }
                }
            }
            if(re_gig_board) {
                console.log('regig break')
                break;
            }
        }

        if(!re_gig_board) {
            for(column=0;column<this.#maxColumn;column++) {
                valid_vert=0;
                vert_local_stores={};
                my_counter_vert=false;

                // console.log('----------');
                for(row=0;row<this.#maxRow;row++) {
                    tmptable=table.find('tr').eq(row).find('td').eq(column);
                    // console.log('col='+(column)+' row='+row+' class='+tmptable.hasClass(colour));
                    // console.log(tmptable.find('td').eq(row).hasClass(colour));
                    if(tmptable.hasClass(colour) && tmptable.attr('cannot_destroy_others')==undefined) {
                        vert_local_stores_mine[row]=tmptable;
                        valid_vert=0;
                        my_counter_vert=true;
                    }else if(my_counter_vert) {
                        vert_local_stores[row]=tmptable;
                        valid_vert++;
                    }else valid_vert=0;

                    if(valid_vert>=this.#countersNeededToDestroy) {
                        if(table.find('tr').eq(row + 1).find('td').eq(column).hasClass(colour) && table.find('tr').eq(row + 1).find('td').eq(column).attr('cannot_destroy_others')==undefined) {
                            vert_local_stores_mine[row + 1]=table.find('tr').eq(row + 1).find('td').eq(column);
                            $.each(vert_local_stores,function(k,i){
                                $(this).removeClass('red yellow');
                            });
                            $.each(vert_local_stores_mine,function(k,i){
                                $(this).attr('cannot_destroy_others','true')
                            });
                            re_gig_board=true;
                            break;
                        }
                    }
                }
                if(re_gig_board) {
                    console.log('regig break')
                    break;
                }
            }
        }

        // console.log('regiging '+re_gig_board)
        if(!re_gig_board) return false;

        let tmptable_=null;

        for(row=this.#maxRow-1;row>=0;row--) {
            tmptable=table.find('tr').eq(row);
            // tmptable.find('td').removeClass('red yellow').addClass('dev')

            // console.log('row='+row);

            for(column=0;column<this.#maxColumn;column++) {

                // console.log('>'+tmptable.find('td').eq(column).attr('class')+' '+column+' '+this.#maxColumn)
                if((tmptable.find('td').eq(column).attr('class')==undefined || tmptable.find('td').eq(column).attr('class')=='') && row>0) {
                    tmptable_=table.find('tr').eq(row - 1);
                    // console.log('--');
                    // console.log(tmptable_.find('td').eq(column));
                    // console.log(tmptable_.find('td').eq(column).attr('class'))
                    if((tmptable_.find('td').eq(column).attr('class')!=undefined && tmptable_.find('td').eq(column).attr('class')!='')) {
                        // console.log('moving')
                        tmptable.find('td').eq(column).attr('class',tmptable_.find('td').eq(column).attr('class'));
                        if(tmptable_.find('td').eq(column).attr('cannot_destroy_others')!=undefined) tmptable.find('td').eq(column).attr('cannot_destroy_others','cannot_destroy_others');

                        tmptable_.find('td').eq(column).attr('class','');
                        tmptable_.find('td').eq(column).removeAttr('cannot_destroy_others');
                    }
                }
            }
            // if(row==0) break;
        }

    }
}

class player {
    #current_player=0;
    #player1_wins=0;
    #player2_wins=0;

    constructor() {
        this.details();
    }

    whos_turn() {
        return this.#current_player;
    }
    winners() {
        return this.#player1_wins+ ' '+this.#player2_wins;
    }

    details() {
        $('#player').find('.scores').text('Score : Player (1) '+this.#player1_wins+' - Player (2) '+this.#player2_wins);
        $('#player').find('.current_player').text('Player '+(this.#current_player + 1)).attr('player',this.#current_player);
    }
    
    reset() {
        this.#current_player=0;
        this.#player1_wins=0;
        this.#player2_wins=0;
        this.details();
    }

    play(oop,column) {
        if(!oop.spacesFree()) {
            return false;
        }
        this.details();
        oop.move(column,this);

        //check if a connect four was made
        // console.log(oop.connectFour(this));
        // console.log('regiging board');
        if(oop.specialConnectFour(this)) {
            console.log('regiging board');
        }

        if(oop.connectFour(this)) {
            if(this.#current_player==0) this.#player1_wins=this.#player1_wins+1;
            else this.#player2_wins=this.#player2_wins+1;
            // console.log('YOU WON')
            oop.constructBoard();
        }else{
            this.#current_player=(this.#current_player==0?1:0);
        }
        this.details();
        return true;
    }
}

const boards = new board();
const players = new player();


// $('#game table tbody').find('tr').eq(5).find('td').eq(0).addClass('red')
// $('#game table tbody').find('tr').eq(5).find('td').eq(1).addClass('yellow')
// $('#game table tbody').find('tr').eq(4).find('td').eq(1).addClass('red')


$(document).on('click','button.counter',function() {
    let column=$(this).attr('column');
    if(column==undefined||column==null) return;
    players.play(boards,parseInt(column))
});

$(document).on('click','button.reset',function() {
    boards.reset();
    boards.constructBoard();
    players.reset();
});
$(document).on('click','button.update',function() {
    boards.updateBoard();
    boards.constructBoard();
    players.reset();
    // boards = new board();
    // players = new player();
});