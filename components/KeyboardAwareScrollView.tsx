import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  View,
  StyleSheet,
  ScrollViewProps,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface KeyboardAwareScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
  extraScrollHeight?: number;
  enableAutomaticScroll?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
}

export default function KeyboardAwareScrollView({
  children,
  extraScrollHeight = 20,
  enableAutomaticScroll = true,
  keyboardShouldPersistTaps = 'handled',
  style,
  contentContainerStyle,
  ...scrollViewProps
}: KeyboardAwareScrollViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [currentlyFocusedField, setCurrentlyFocusedField] = useState<any>(null);
  
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      handleKeyboardShow
    );
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      handleKeyboardHide
    );

    const dimensionListener = Dimensions.addEventListener('change', handleDimensionChange);

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
      dimensionListener?.remove();
    };
  }, []);

  const handleKeyboardShow = (event: any) => {
    const { height } = event.endCoordinates;
    setKeyboardHeight(height);
    
    if (enableAutomaticScroll && currentlyFocusedField) {
      setTimeout(() => {
        scrollToFocusedField();
      }, 150); // Slightly longer delay for iOS
    }
  };

  const handleKeyboardHide = () => {
    setKeyboardHeight(0);
  };

  const handleDimensionChange = ({ window }: any) => {
    setScreenHeight(window.height);
  };

  const scrollToFocusedField = () => {
    if (!currentlyFocusedField || !scrollViewRef.current) return;

    currentlyFocusedField.measureInWindow((x: number, y: number, width: number, height: number) => {
      const fieldBottom = y + height;
      const availableHeight = screenHeight - keyboardHeight - insets.top - insets.bottom;
      const scrollOffset = fieldBottom - availableHeight + extraScrollHeight;

      if (scrollOffset > 0) {
        scrollViewRef.current?.scrollTo({
          y: scrollOffset,
          animated: true,
        });
      }
    });
  };

  const handleScrollViewLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
  };

  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    setContentHeight(contentHeight);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Optional: Handle scroll events for additional functionality
    scrollViewProps.onScroll?.(event);
  };

  // Calculate available height considering keyboard
  const availableHeight = Math.max(
    screenHeight - keyboardHeight - insets.top - insets.bottom,
    200 // Minimum height to prevent layout collapse
  );
  const needsScrolling = contentHeight > availableHeight;

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Remove offset that may interfere
    >
      <ScrollView
        ref={scrollViewRef}
        style={[
          styles.scrollView, 
          Platform.OS === 'ios' && keyboardHeight === 0 
            ? { flex: 1 } // Use flex when keyboard is hidden
            : { maxHeight: availableHeight }
        ]}
        contentContainerStyle={[
          styles.contentContainer,
          contentContainerStyle,
          needsScrolling && { paddingBottom: extraScrollHeight },
          Platform.OS === 'ios' && { flexGrow: 1 } // Ensure content can grow on iOS
        ]}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        showsVerticalScrollIndicator={needsScrolling}
        scrollEnabled={true}
        bounces={Platform.OS === 'ios'}
        alwaysBounceVertical={false}
        onLayout={handleScrollViewLayout}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        {...scrollViewProps}
      >
        <KeyboardFieldTracker onFieldFocus={setCurrentlyFocusedField}>
          {children}
        </KeyboardFieldTracker>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Helper component to track focused fields
interface KeyboardFieldTrackerProps {
  children: React.ReactNode;
  onFieldFocus: (field: any) => void;
}

function KeyboardFieldTracker({ children, onFieldFocus }: KeyboardFieldTrackerProps) {
  const fieldRefs = useRef<Map<string, any>>(new Map());

  const registerField = (id: string, ref: any) => {
    fieldRefs.current.set(id, ref);
  };

  const handleFieldFocus = (id: string) => {
    const field = fieldRefs.current.get(id);
    if (field) {
      onFieldFocus(field);
    }
  };

  // Clone children and add focus tracking
  const enhancedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as any, {
        key: index,
        fieldTracker: { registerField, handleFieldFocus }
      });
    }
    return child;
  });

  return <>{enhancedChildren}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    flexShrink: 1,
  },
  contentContainer: {
    flexGrow: 1,
    ...(Platform.OS === 'ios' && {
      minHeight: '100%', // Ensure full height utilization on iOS
    }),
  },
});