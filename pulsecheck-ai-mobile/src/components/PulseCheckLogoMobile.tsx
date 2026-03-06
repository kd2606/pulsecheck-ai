import React from "react";
import Svg, {
    Defs,
    LinearGradient,
    RadialGradient,
    Stop,
    Filter,
    FeGaussianBlur,
    FeMerge,
    FeMergeNode,
    ClipPath,
    Rect,
    Circle,
    Polyline,
    Line,
    Text as SvgText,
    G,
} from "react-native-svg";
import { View, StyleSheet } from "react-native";

interface PulseCheckLogoMobileProps {
    /** Size in dp. Default: 80 */
    size?: number;
    /** Show "PulseCheck AI" and tagline below icon. Default: false */
    showWordmark?: boolean;
}

export function PulseCheckLogoMobile({ size = 80, showWordmark = false }: PulseCheckLogoMobileProps) {
    // SVG is 500×500 viewBox. Scale accordingly.
    return (
        <View style={[styles.wrap, showWordmark && { alignItems: "center" }]}>
            <Svg
                width={size}
                height={size}
                viewBox="0 0 500 500"
            >
                <Defs>
                    {/* Background gradient */}
                    <LinearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#0a0a0a" />
                        <Stop offset="100%" stopColor="#000000" />
                    </LinearGradient>

                    {/* Circle background */}
                    <RadialGradient id="circleGrad" cx="50%" cy="40%" r="60%">
                        <Stop offset="0%" stopColor="#111111" />
                        <Stop offset="100%" stopColor="#050505" />
                    </RadialGradient>

                    {/* Pulse line gradient */}
                    <LinearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <Stop offset="0%" stopColor="#00ff88" stopOpacity={0} />
                        <Stop offset="20%" stopColor="#00ff88" stopOpacity={0.5} />
                        <Stop offset="50%" stopColor="#00ff88" stopOpacity={1} />
                        <Stop offset="80%" stopColor="#00e5ff" stopOpacity={0.5} />
                        <Stop offset="100%" stopColor="#00e5ff" stopOpacity={0} />
                    </LinearGradient>

                    {/* Ring gradient */}
                    <LinearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#00ff88" stopOpacity={0.9} />
                        <Stop offset="40%" stopColor="#00e5ff" stopOpacity={0.6} />
                        <Stop offset="100%" stopColor="#00ff88" stopOpacity={0.1} />
                    </LinearGradient>

                    {/* Shimmer */}
                    <RadialGradient id="shimmer" cx="50%" cy="20%" r="50%">
                        <Stop offset="0%" stopColor="#00ff88" stopOpacity={0.08} />
                        <Stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
                    </RadialGradient>

                    {/* Dot glow */}
                    <RadialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
                        <Stop offset="0%" stopColor="#00ff88" stopOpacity={1} />
                        <Stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
                    </RadialGradient>

                    {/* Glow filter for the pulse line */}
                    <Filter id="lineGlow" x="-30%" y="-100%" width="160%" height="300%">
                        <FeGaussianBlur stdDeviation="4" result="blur" />
                        <FeMerge>
                            <FeMergeNode in="blur" />
                            <FeMergeNode in="blur" />
                            <FeMergeNode in="SourceGraphic" />
                        </FeMerge>
                    </Filter>

                    {/* Ring glow filter */}
                    <Filter id="ringGlow" x="-10%" y="-10%" width="120%" height="120%">
                        <FeGaussianBlur stdDeviation="3" result="blur" />
                        <FeMerge>
                            <FeMergeNode in="blur" />
                            <FeMergeNode in="SourceGraphic" />
                        </FeMerge>
                    </Filter>

                    {/* Center dot glow filter */}
                    <Filter id="centerDotGlow" x="-200%" y="-200%" width="500%" height="500%">
                        <FeGaussianBlur stdDeviation="10" result="blur" />
                        <FeMerge>
                            <FeMergeNode in="blur" />
                            <FeMergeNode in="blur" />
                            <FeMergeNode in="SourceGraphic" />
                        </FeMerge>
                    </Filter>

                    {/* Text glow filter */}
                    <Filter id="textGlow" x="-10%" y="-30%" width="120%" height="160%">
                        <FeGaussianBlur stdDeviation="3" result="blur" />
                        <FeMerge>
                            <FeMergeNode in="blur" />
                            <FeMergeNode in="SourceGraphic" />
                        </FeMerge>
                    </Filter>

                    {/* Circle clip */}
                    <ClipPath id="circleClip">
                        <Circle cx="250" cy="215" r="148" />
                    </ClipPath>
                </Defs>

                {/* Background */}
                <Rect width="500" height="500" fill="url(#bgGrad)" rx="80" />

                {/* Subtle grid lines */}
                <G opacity="0.025" stroke="#ffffff" strokeWidth="0.4">
                    {[83, 166, 249, 332, 415].map(y => <Line key={`h${y}`} x1="0" y1={y} x2="500" y2={y} />)}
                    {[83, 166, 249, 332, 415].map(x => <Line key={`v${x}`} x1={x} y1="0" x2={x} y2="500" />)}
                </G>

                {/* Outermost orbit rings */}
                <Circle cx="250" cy="215" r="168" fill="none" stroke="#00ff88" strokeWidth="0.4" opacity="0.08" />
                <Circle cx="250" cy="215" r="178" fill="none" stroke="#00ff88" strokeWidth="0.3" opacity="0.04" />

                {/* Main circle */}
                <Circle cx="250" cy="215" r="148" fill="url(#circleGrad)" />
                <Circle cx="250" cy="215" r="148" fill="url(#shimmer)" />

                {/* Glowing ring */}
                <Circle cx="250" cy="215" r="148" fill="none" stroke="url(#ringGrad)" strokeWidth="1.8" filter="url(#ringGlow)" />
                <Circle cx="250" cy="215" r="140" fill="none" stroke="#00ff88" strokeWidth="0.4" opacity="0.08" />

                {/* ECG Pulse line */}
                <G filter="url(#lineGlow)" clipPath="url(#circleClip)">
                    {/* Shadow */}
                    <Polyline
                        points="102,215 148,215 166,182 184,250 200,198 216,236 230,170 248,265 266,170 282,236 298,198 314,250 332,182 350,215 398,215"
                        fill="none"
                        stroke="#00ff88"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.2"
                    />
                    {/* Bright glowing line */}
                    <Polyline
                        points="102,215 148,215 166,182 184,250 200,198 216,236 230,170 248,265 266,170 282,236 298,198 314,250 332,182 350,215 398,215"
                        fill="none"
                        stroke="url(#pulseGrad)"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </G>

                {/* Center glowing dot */}
                <Circle cx="250" cy="215" r="14" fill="url(#dotGlow)" opacity="0.15" filter="url(#centerDotGlow)" />
                <Circle cx="250" cy="215" r="5" fill="#00ff88" opacity="0.95" filter="url(#centerDotGlow)" />
                <Circle cx="250" cy="215" r="2.5" fill="white" opacity="0.9" />

                {/* Apple Watch–style tick marks */}
                <G stroke="#00ff88" strokeWidth="1" opacity="0.25">
                    <Line x1="250" y1="67" x2="250" y2="75" />
                    <Line x1="250" y1="355" x2="250" y2="363" />
                    <Line x1="102" y1="215" x2="110" y2="215" />
                    <Line x1="390" y1="215" x2="398" y2="215" />
                </G>

                {/* Wordmark */}
                <SvgText
                    x="250" y="408"
                    textAnchor="middle"
                    fontFamily="Helvetica Neue, Helvetica, sans-serif"
                    fontSize="40"
                    fontWeight="700"
                    letterSpacing="-1.5"
                    fill="white"
                    opacity="0.97"
                >
                    PulseCheck
                </SvgText>

                {/* Thin divider */}
                <Line x1="190" y1="420" x2="310" y2="420" stroke="#00ff88" strokeWidth="0.6" opacity="0.4" />

                {/* "AI" label */}
                <SvgText
                    x="250" y="445"
                    textAnchor="middle"
                    fontFamily="Helvetica Neue, Helvetica, sans-serif"
                    fontSize="14"
                    fontWeight="500"
                    letterSpacing="8"
                    fill="#00ff88"
                    opacity="0.9"
                    filter="url(#textGlow)"
                >
                    A I
                </SvgText>

                {/* Tagline */}
                <SvgText
                    x="250" y="470"
                    textAnchor="middle"
                    fontFamily="Helvetica Neue, Helvetica, sans-serif"
                    fontSize="9.5"
                    fontWeight="300"
                    letterSpacing="3"
                    fill="white"
                    opacity="0.22"
                >
                    HEALTH · INTELLIGENCE · CARE
                </SvgText>
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        alignSelf: "flex-start",
    },
});
