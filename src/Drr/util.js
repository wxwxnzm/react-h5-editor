
export const getQuadrants = (rotate) => {
    let count = -22.5;
    let arrs = new Array(8).fill(0).map((item) => {
        return count+=45;
    });
    /* 拿到象限 [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5] */
    if ((rotate <= arrs[0] || rotate >= arrs[arrs.length - 1])) {
        // console.log(arrs[arrs.length - 1], 'arrs[arrs.length - 1]', rotate)
        return 0;
    } else {
        for(let i = 0; i < arrs.length;i++) {
            // console.log(rotate, arrs[i], 'arrs[i]', rotate >= arrs[i], rotate <= arrs[i + 1],arrs[i + 1])
            if (rotate >= arrs[i] && rotate <= arrs[i + 1]) {
                return i + 1;
            }
        }
    }
    
}

export const quadrantsArr = [
    ['nw', 'n','ne', 'e','se','s', 'sw', 'w'],
    ['n','ne', 'e','se','s', 'sw', 'w', 'nw'],
    ['ne', 'e','se','s', 'sw', 'w', 'nw', 'n'],
    ['e','se','s', 'sw', 'w', 'nw', 'n','ne'],
    ['se','s', 'sw', 'w', 'nw', 'n','ne', 'e'],
    ['s', 'sw', 'w', 'nw', 'n','ne', 'e', 'se'],
    ['sw', 'w', 'nw', 'n','ne', 'e', 'se', 's'],
    ['w', 'nw', 'n','ne', 'e', 'se', 's', 'sw']
]

export function round(v,e){ // 乘法，取整，除法
    var t=1;
    for(;e>0;t*=10,e--);
    return Math.round(v*t)/t;
}