import type { NodeInput, NodeOutput } from './types';

interface PresetConfig {
  label: string;
  prompt: string;
  inputs: Omit<NodeInput, 'id'>[];
  outputs: Omit<NodeOutput, 'id'>[];
}

export const PRESET_CONFIGS: Record<string, PresetConfig> = {
    'to-figure': {
        label: '图片变手办',
        prompt: 'turn this photo into a character figure. Behind it, place a box with the character’s image printed on it, and a computer showing the Blender modeling process on its screen. In front of the box, add a round plastic base with the character figure standing on it. set the scene indoors if possible',
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'change-angle': {
        label: '切换人物视角',
        prompt: 'change the Camera anglo a high-angled selfie perspective looking down at the woman, while preserving her exact facial features, expression, and clothing, Maintain the same living room interior background with the sofa, natural lighting, and overall photographic composition and style.',
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'arch-to-model': {
        label: '建筑图转模型',
        prompt: 'convert this photo into a architecture model. Behind the model, there should be a cardboard box with an image of the architecture from the photo on it. There should also be a computer, with the content on the computer screen showing the Blender modeling process of the figurine. In front of the cardboard box, place a cardstock and put the architecture model from the photo I provided on it. I hope the PVC material can be clearly presented. It would be even better if the background is indoors.',
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'combine-objects': {
        label: '组合物体',
        prompt: '把它们组合起来',
        inputs: [{ label: 'Image 1', type: 'image' }, { label: 'Image 2', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'high-res': {
        label: '高清修复',
        prompt: 'Enhance this image to high resolution',
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'to-line-art': {
        label: '图转线稿',
        prompt: '变成线稿手绘图',
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'colorize-by-palette': {
        label: '按照色卡上色',
        prompt: '准确使用色卡上色',
        inputs: [{ label: 'Image', type: 'image' }, { label: 'Palette', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'generate-char-sheet': {
        label: '生成一套角色设定',
        prompt: '为我生成人物的角色设定（Character Design）: 比例设定（不同身高对比、头身比等）, 三视图（正面、侧面、背面）, 表情设定（Expression Sheet）, 动作设定（Pose Sheet） → 各种常见姿势, 服装设定（Costume Design）',
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'virtual-real-combo': {
        label: '虚实结合/跨次元',
        prompt: '在图中加上一对情侣坐在座位上开心的喝咖啡和交谈，人物都是粗线稿可爱插画风格',
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'anime-to-real': {
        label: '动漫转真人',
        prompt: 'Generate a highly detailed photo of a girl cosplaying this illustration, at Comiket. Exactly replicate the same pose, body posture, hand gestures, facial expression, and camera framing as in the original illustration. Keep the same angle, perspective, and composition, without any deviation',
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'pose-reference': {
        label: '姿势参考',
        prompt: '人物准确换成姿势图的姿势，专业摄影棚拍摄',
        inputs: [{ label: 'Person', type: 'image' }, { label: 'Pose', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'to-action-figure': {
        label: '图片转人偶玩具',
        prompt: "Transform the person in the photo into a highly detailed action figure. Place the action figure inside its original toy packaging box, which should be styled like a collectible item. The box should have dynamic artwork and a clear plastic window showing the figure. Place the box in a clean, professional studio environment, like for a product photoshoot. Visualize this in a highly realistic way with attention to fine details on both the figure and the packaging.",
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'to-funko-pop': {
        label: '图片转 Funko Pop',
        prompt: "Transform the person in the photo into the style of a Funko Pop figure packaging box, presented in an isometric perspective. Label the packaging with the title 'ZHOGUE'. Inside the box, showcase the figure based on the person in the photo, accompanied by their essential items (such as cosmetics, bags, or others). Next to the box, also display the actual figure itself outside of the packaging, rendered in a realistic and lifelike style.",
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'to-lego': {
        label: '图片转乐高',
        prompt: "Transform the person in the photo into the style of a LEGO minifigure packaging box, presented in an isometric perspective. Label the packaging with the title 'ZHOGUE'. Inside the box, showcase the LEGO minifigure based on the person in the photo, accompanied by their essential items (such as cosmetics, bags, or others) as LEGO accessories. Next to the box, also display the actual LEGO minifigure itself outside of the packaging, rendered in a realistic and lifelike style.",
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'to-knit-doll': {
        label: '图片转针织玩偶',
        prompt: 'A close-up, professionally composed photograph showing a handmade crocheted yarn doll being gently held in both hands. The doll has a rounded shape and an adorable chibi-style appearance, with vivid color contrasts and rich details. The hands holding the doll appear natural and tender, with clearly visible finger posture, and the skin texture and light-shadow transitions look soft and realistic, conveying a warm, tangible touch. The background is slightly blurred, depicting an indoor setting with a warm wooden tabletop and natural light streaming in through a window, creating a cozy and intimate atmosphere. The overall image conveys a sense of exquisite craftsmanship and a cherished, heartwarming emotion.',
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'to-barbie': {
        label: '图片转芭比娃娃',
        prompt: "Transform the person in the photo into the style of a Barbie doll packaging box, presented in an isometric perspective. Label the packaging with the title 'ZHOGUE'. Inside the box, showcase the Barbie doll version of the person from the photo, accompanied by their essential items (such as cosmetics, bags, or others) designed as stylish Barbie accessories. Next to the box, also display the actual Barbie doll itself outside of the packaging, rendered in a realistic and lifelike style, resembling official Barbie promotional renders",
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'to-gundam': {
        label: '万物变高达',
        prompt: "Transform the person in the photo into the style of a Gundam model kit packaging box, presented in an isometric perspective. Label the packaging with the title 'ZHOGUE'. Inside the box, showcase a Gundam-style mecha version of the person from the photo, accompanied by their essential items (such as cosmetics, bags, or others) redesigned as futuristic mecha accessories. The packaging should resemble authentic Gunpla boxes, with technical illustrations, instruction-manual style details, and sci-fi typography. Next to the box, also display the actual Gundam-style mecha figure itself outside of the packaging, rendered in a realistic and lifelike style, similar to official Bandai promotional renders.",
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'generate-child': {
        label: '赛博生娃',
        prompt: '生成图中两人物所生孩子的样子，专业摄影',
        inputs: [{ label: 'Parent 1', type: 'image' }, { label: 'Parent 2', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'product-render': {
        label: '产品设计图转渲染',
        prompt: 'turn this illustration of a perfume into a realistic version, Frosted glass bottle with a marble cap',
        inputs: [{ label: 'Design', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'pro-photo': {
        label: '秒变专业摄影大片',
        prompt: 'Transform the person in the photo into highly stylized ultra-realistic portrait, with sharp facial features and flawless fair skin, standing confidently against a bold green gradient background. Dramatic, cinematic lighting highlights her facial structure, evoking the look of a luxury fashion magazine cover. Editorial photography style, high-detail, 4K resolution, symmetrical composition, minimalistic background',
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'lighting-reference': {
        label: '光影参考',
        prompt: '原图换成参考图打光，专业摄影',
        inputs: [{ label: 'Subject', type: 'image' }, { label: 'Light Ref', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'generate-process': {
        label: '生成绘画过程',
        prompt: '为人物生成绘画过程四宫格，第一步：线稿，第二步平铺颜色，第三步：增加阴影，第四步：细化成型。不要文字',
        inputs: [{ label: 'Subject', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'to-realistic': {
        label: '任何风格变写实',
        prompt: 'turn this illustration into realistic version',
        inputs: [{ label: 'Image', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'to-keychain': {
        label: '图片变挂件',
        prompt: '把这张照片变成一个可爱挂件 挂在 照片的包包上',
        inputs: [{ label: 'Subject & Bag', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'add-effect': {
        label: '指定效果叠加',
        prompt: '为图片照片叠加上效果图片的效果',
        inputs: [{ label: 'Base', type: 'image' }, { label: 'Effect', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'product-packaging': {
        label: '产品包装贴合',
        prompt: '把图片贴在包装盒上，并放在极简设计的布景中，专业摄影',
        inputs: [{ label: 'Sticker', type: 'image' }, { label: 'Box', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'virtual-makeup': {
        label: '虚拟试妆',
        prompt: '为人物化上图片的妆，还保持人物原本的姿势',
        inputs: [{ label: 'Face', type: 'image' }, { label: 'Makeup', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
    'expression-reference': {
        label: '表情参考',
        prompt: '人物换成新图片的表情',
        inputs: [{ label: 'Face', type: 'image' }, { label: 'Expression', type: 'image' }],
        outputs: [{ label: 'Image', type: 'image' }]
    },
};