const db = require('../utils/db');

module.exports ={
    getNumberOfItems(cart){
        let n=0;
        for(const item of cart){
            n+=1;
        }
        return n;
    },

    add(cart,item){
        for(const ci of cart){
            if(ci.id === item.id){
                return;
            }
        }
        cart.push(item);
    },

    remove(cart,id){
        for(let i = cart.length -1; i>=0;i--){
            if(id===cart[i].id){
                cart.splice(i,1);
                return;
            }
        }
    },

    getTotal(items){
        let total=0;
        for(let i = items.length -1; i>=0;i--){
            total+=items[i].price;
        }
        return total;
    },

    async addRegister(register) {
        const [result, fields] = await db.add(register, 'registers');
        console.log(result);
        return result;
    },
};