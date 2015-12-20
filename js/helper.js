 function compare(a,b) {
      if (parseInt(a.relevancia()) < parseInt(b.relevancia()))
        return -1;
      if (parseInt(a.relevancia()) > parseInt(b.relevancia()))
        return 1;
      return 0;
    } 